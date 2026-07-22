import "server-only";

import ky from "ky";
import { z } from "zod";

import { ADMIN_ROLES } from "@/lib/api/operations";
import { AdminAuthError } from "@/lib/auth/errors";
import {
  callbackEnvelopeSchema,
  KAKAO_CALLBACK_PATH,
  KAKAO_STATE_COOKIE_NAME,
  upstreamClearCookie,
  validStateSetCookie,
  validatedOAuthLocation,
  type KakaoCallbackInput,
} from "@/lib/auth/kakao-contract";
import { ADMIN_ROLE_DEFAULT_ROUTES } from "@/lib/auth/roles";
import { sealAdminSession } from "@/lib/auth/session";
import type { SealedAdminSession } from "@/lib/auth/session-schema";
import { env } from "@/lib/env";

const OAUTH_ERROR_MESSAGES = {
  oauth_start_rejected: "OAuth start was rejected by the authentication service.",
  oauth_start_unavailable: "OAuth start is temporarily unavailable.",
  oauth_start_invalid_response: "OAuth start returned an invalid response.",
  oauth_callback_invalid: "OAuth callback input is invalid.",
  oauth_callback_rejected: "OAuth callback was rejected by the authentication service.",
  oauth_callback_unavailable: "OAuth callback is temporarily unavailable.",
  oauth_callback_invalid_response: "OAuth callback returned an invalid response.",
  oauth_role_unsupported: "The authenticated role is not supported by this application.",
} as const;

export type OAuthErrorCode = keyof typeof OAUTH_ERROR_MESSAGES;

export class OAuthFlowError extends Error {
  readonly name = "OAuthFlowError";

  constructor(
    readonly code: OAuthErrorCode,
    readonly upstreamStatus?: number,
    options?: ErrorOptions,
  ) {
    super(OAUTH_ERROR_MESSAGES[code], options);
  }
}

export type KakaoOAuthStartResult =
  | { readonly ok: true; readonly location: string; readonly stateCookie: string }
  | { readonly ok: false; readonly error: OAuthFlowError };

export type KakaoCallbackResult =
  | {
      readonly ok: true;
      readonly redirectTo: string;
      readonly sealedSession: SealedAdminSession;
      readonly stateClearCookie: string;
    }
  | {
      readonly ok: false;
      readonly error: OAuthFlowError;
      readonly stateClearCookie?: string;
    };

const UPSTREAM_OPTIONS = {
  cache: "no-store",
  credentials: "omit",
  redirect: "manual",
  retry: 0,
  throwHttpErrors: false,
  timeout: 10_000,
  headers: { Accept: "application/json" },
} as const;

function callbackFailure(
  error: OAuthFlowError,
  stateClearCookie?: string,
): KakaoCallbackResult {
  return stateClearCookie === undefined
    ? { ok: false, error }
    : { ok: false, error, stateClearCookie };
}

function callbackStatusError(status: number): OAuthFlowError {
  if (status >= 500) return new OAuthFlowError("oauth_callback_unavailable", status);
  if (status === 400 || status === 401 || status === 403 || status === 422) {
    return new OAuthFlowError("oauth_callback_rejected", status);
  }
  return new OAuthFlowError("oauth_callback_invalid_response", status);
}

export async function startKakaoOAuth(): Promise<KakaoOAuthStartResult> {
  let response: Response;
  try {
    response = await ky.get(new URL("/auth/kakao", env.ADMIN_API_BASE_URL),
      UPSTREAM_OPTIONS,
    );
  } catch (cause) {
    if (cause instanceof Error) {
      return {
        ok: false,
        error: new OAuthFlowError("oauth_start_unavailable", undefined, { cause }),
      };
    }
    throw cause;
  }

  if (response.status !== 302) {
    const code = response.status >= 500
      ? "oauth_start_unavailable"
      : "oauth_start_rejected";
    return { ok: false, error: new OAuthFlowError(code, response.status) };
  }
  const location = validatedOAuthLocation(response.headers.get("location"));
  const cookies = response.headers.getSetCookie();
  if (location === null || cookies.length !== 1 || !validStateSetCookie(cookies[0])) {
    return {
      ok: false,
      error: new OAuthFlowError("oauth_start_invalid_response", response.status),
    };
  }
  return { ok: true, location, stateCookie: cookies[0] };
}

export async function completeKakaoOAuth(
  input: KakaoCallbackInput,
): Promise<KakaoCallbackResult> {
  const callbackUrl = new URL(KAKAO_CALLBACK_PATH, env.ADMIN_API_BASE_URL);
  callbackUrl.searchParams.set("code", input.code);
  callbackUrl.searchParams.set("state", input.state);

  let response: Response;
  try {
    response = await ky.get(callbackUrl, {
      ...UPSTREAM_OPTIONS,
      headers: {
        Accept: "application/json",
        Cookie: `${KAKAO_STATE_COOKIE_NAME}=${input.stateCookie}`,
      },
    });
  } catch (cause) {
    if (cause instanceof Error) {
      return callbackFailure(
        new OAuthFlowError("oauth_callback_unavailable", undefined, { cause }),
      );
    }
    throw cause;
  }

  const stateClearCookie = upstreamClearCookie(response.headers);
  if (response.status !== 200) {
    return callbackFailure(callbackStatusError(response.status), stateClearCookie);
  }
  if (stateClearCookie === undefined) {
    return callbackFailure(
      new OAuthFlowError("oauth_callback_invalid_response", response.status),
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (cause) {
    if (cause instanceof Error) {
      return callbackFailure(
        new OAuthFlowError("oauth_callback_invalid_response", response.status, {
          cause,
        }),
        stateClearCookie,
      );
    }
    throw cause;
  }
  const envelope = callbackEnvelopeSchema.safeParse(payload);
  if (!envelope.success) {
    return callbackFailure(
      new OAuthFlowError("oauth_callback_invalid_response", response.status, {
        cause: envelope.error,
      }),
      stateClearCookie,
    );
  }
  const role = z.enum(ADMIN_ROLES).safeParse(envelope.data.user.role);
  if (!role.success) {
    return callbackFailure(
      new OAuthFlowError("oauth_role_unsupported", response.status, {
        cause: role.error,
      }),
      stateClearCookie,
    );
  }

  try {
    const sealedSession = await sealAdminSession({
      sub: envelope.data.user.id,
      role: role.data,
      displayName: envelope.data.user.name,
      accessToken: envelope.data.accessToken,
      refreshToken: envelope.data.refreshToken,
    });
    return {
      ok: true,
      redirectTo: ADMIN_ROLE_DEFAULT_ROUTES[role.data],
      sealedSession,
      stateClearCookie,
    };
  } catch (cause) {
    if (cause instanceof AdminAuthError) {
      return callbackFailure(
        new OAuthFlowError("oauth_callback_invalid_response", response.status, {
          cause,
        }),
        stateClearCookie,
      );
    }
    throw cause;
  }
}
