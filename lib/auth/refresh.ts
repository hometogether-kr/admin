import "server-only";

import { decodeJwt, errors } from "jose";
import ky from "ky";
import { z } from "zod";

import { ADMIN_ROLES } from "@/lib/api/operations";
import { AdminAuthError } from "@/lib/auth/errors";
import { readAdminSession, sealAdminSession } from "@/lib/auth/session";
import {
  adminSessionInputSchema,
  type AdminSessionInput,
  type SealedAdminSession,
} from "@/lib/auth/session-schema";
import { env } from "@/lib/env";

export const REFRESH_ATTEMPT_CEILING = 1 as const;

const tokenPairSchema = z
  .strictObject({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
  })
  .readonly();
const accessJwtHintSchema = z
  .strictObject({
    sub: z.uuid(),
    role: z.string().min(1),
    adminRole: z.string().nullable(),
    onboardingCompleted: z.boolean(),
    iat: z.number().int().nonnegative(),
    exp: z.number().int().positive(),
  })
  .superRefine((claims, context) => {
    if (claims.exp <= claims.iat) {
      context.addIssue({
        code: "custom",
        path: ["exp"],
        message: "Access expiry must follow its issue time",
      });
    }
  })
  .readonly();

const REFRESH_ERROR_MESSAGES = {
  refresh_session_invalid: "A valid administrator session is required.",
  refresh_rejected: "Session refresh was rejected by the authentication service.",
  refresh_unavailable: "Session refresh is temporarily unavailable.",
  refresh_response_invalid: "Session refresh returned an invalid response.",
  refresh_role_unsupported: "The refreshed role is not supported by this application.",
  refresh_subject_mismatch: "The refreshed subject does not match the session.",
} as const;

export type RefreshErrorCode = keyof typeof REFRESH_ERROR_MESSAGES;

export class AdminRefreshError extends Error {
  readonly name = "AdminRefreshError";

  constructor(
    readonly code: RefreshErrorCode,
    readonly upstreamStatus?: number,
    options?: ErrorOptions,
  ) {
    super(REFRESH_ERROR_MESSAGES[code], options);
  }
}

export type RefreshAdminSessionResult =
  | {
      readonly ok: true;
      readonly session: AdminSessionInput;
      readonly sealedSession: SealedAdminSession;
    }
  | {
      readonly ok: false;
      readonly error: AdminRefreshError;
    };

function failedRefresh(error: AdminRefreshError): RefreshAdminSessionResult {
  return {
    ok: false,
    error,
  };
}

function statusError(status: number): AdminRefreshError {
  if (status >= 500) return new AdminRefreshError("refresh_unavailable", status);
  if (status === 400 || status === 401 || status === 403 || status === 422) {
    return new AdminRefreshError("refresh_rejected", status);
  }
  return new AdminRefreshError("refresh_response_invalid", status);
}

/**
 * Performs one stateless upstream refresh. Concurrent successes remain independent;
 * whichever valid response cookie the browser applies last becomes authoritative.
 */
export async function refreshAdminSession(): Promise<RefreshAdminSessionResult> {
  const currentResult = await readAdminSession();
  let current;
  switch (currentResult.kind) {
    case "valid":
      current = currentResult.session;
      break;
    case "missing":
    case "invalid":
    case "expired":
      return failedRefresh(new AdminRefreshError("refresh_session_invalid"));
    default:
      currentResult satisfies never;
      return failedRefresh(new AdminRefreshError("refresh_session_invalid"));
  }

  let response: Response;
  try {
    response = await ky.post(new URL("/auth/refresh", env.ADMIN_API_BASE_URL), {
      cache: "no-store",
      credentials: "omit",
      redirect: "manual",
      retry: 0,
      throwHttpErrors: false,
      timeout: 10_000,
      headers: { Accept: "application/json" },
      json: { refreshToken: current.refreshToken },
    });
  } catch (cause) {
    if (cause instanceof Error) {
      return failedRefresh(
        new AdminRefreshError("refresh_unavailable", undefined, { cause }),
      );
    }
    throw cause;
  }

  if (response.status !== 200) {
    return failedRefresh(statusError(response.status));
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (cause) {
    if (cause instanceof Error) {
      return failedRefresh(
        new AdminRefreshError("refresh_response_invalid", response.status, {
          cause,
        }),
      );
    }
    throw cause;
  }
  const tokenPair = tokenPairSchema.safeParse(payload);
  if (!tokenPair.success) {
    return failedRefresh(
      new AdminRefreshError("refresh_response_invalid", response.status, {
        cause: tokenPair.error,
      }),
    );
  }

  let decodedAccessToken;
  try {
    decodedAccessToken = decodeJwt(tokenPair.data.accessToken);
  } catch (cause) {
    if (cause instanceof errors.JWTInvalid) {
      return failedRefresh(
        new AdminRefreshError("refresh_response_invalid", response.status, {
          cause,
        }),
      );
    }
    throw cause;
  }
  const accessHint = accessJwtHintSchema.safeParse(decodedAccessToken);
  const now = Math.floor(Date.now() / 1_000);
  if (
    !accessHint.success ||
    accessHint.data.iat > now ||
    accessHint.data.exp <= now
  ) {
    return failedRefresh(
      new AdminRefreshError("refresh_response_invalid", response.status, {
        cause: accessHint.success ? undefined : accessHint.error,
      }),
    );
  }
  if (accessHint.data.sub !== current.sub) {
    return failedRefresh(
      new AdminRefreshError("refresh_subject_mismatch", response.status),
    );
  }
  const adminRole = z.enum(ADMIN_ROLES).safeParse(accessHint.data.adminRole);
  if (!adminRole.success) {
    return failedRefresh(
      new AdminRefreshError("refresh_role_unsupported", response.status, {
        cause: adminRole.error,
      }),
    );
  }
  const replacement = adminSessionInputSchema.safeParse({
    sub: current.sub,
    adminRole: adminRole.data,
    displayName: current.displayName,
    accessToken: tokenPair.data.accessToken,
    refreshToken: tokenPair.data.refreshToken,
  });
  if (!replacement.success) {
    return failedRefresh(
      new AdminRefreshError("refresh_response_invalid", response.status, {
        cause: replacement.error,
      }),
    );
  }

  try {
    return {
      ok: true,
      session: replacement.data,
      sealedSession: await sealAdminSession(replacement.data),
    };
  } catch (cause) {
    if (cause instanceof AdminAuthError) {
      return failedRefresh(
        new AdminRefreshError("refresh_response_invalid", response.status, {
          cause,
        }),
      );
    }
    throw cause;
  }
}
