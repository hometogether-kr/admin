import "server-only";

import { randomUUID } from "node:crypto";

import { decodeJwt, EncryptJWT, errors, jwtDecrypt } from "jose";

import { AdminAuthError } from "@/lib/auth/errors";
import {
  clearAdminSessionCookie,
  commitAdminSessionCookie,
  readAdminSessionCookie,
} from "@/lib/auth/session-cookie";
import {
  ADMIN_SESSION_VERSION,
  adminSessionInputSchema,
  adminSessionPayloadSchema,
  encryptedAdminSessionSchema,
  refreshLifetimeMetadataSchema,
  sealedAdminSessionSchema,
  type AdminSessionPayload,
  type SealedAdminSession,
} from "@/lib/auth/session-schema";
import { env } from "@/lib/env";

const sessionKey = Buffer.from(env.ADMIN_SESSION_SECRET, "base64url");

export type AdminSessionReadResult =
  | { readonly kind: "missing" }
  | { readonly kind: "invalid" }
  | { readonly kind: "expired" }
  | { readonly kind: "valid"; readonly session: AdminSessionPayload };

export async function sealAdminSession(input: unknown): Promise<SealedAdminSession> {
  const parsedInput = adminSessionInputSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new AdminAuthError("invalid_session_input", {
      cause: parsedInput.error,
    });
  }

  const now = Math.floor(Date.now() / 1_000);
  let decodedRefreshToken;
  try {
    decodedRefreshToken = decodeJwt(parsedInput.data.refreshToken);
  } catch (cause) {
    if (cause instanceof errors.JWTInvalid) {
      throw new AdminAuthError("invalid_refresh_metadata", { cause });
    }
    throw cause;
  }

  const refreshMetadata = refreshLifetimeMetadataSchema.safeParse(decodedRefreshToken);
  if (!refreshMetadata.success) {
    throw new AdminAuthError("invalid_refresh_metadata", {
      cause: refreshMetadata.error,
    });
  }
  if (refreshMetadata.data.iat > now) {
    throw new AdminAuthError("invalid_refresh_metadata");
  }
  if (refreshMetadata.data.exp <= now) {
    throw new AdminAuthError("expired_refresh_metadata");
  }

  const expiresAt = Math.min(
    refreshMetadata.data.exp,
    now + env.ADMIN_SESSION_MAX_AGE_SECONDS,
  );
  const payload = adminSessionPayloadSchema.parse({
    v: ADMIN_SESSION_VERSION,
    sid: randomUUID(),
    ...parsedInput.data,
    iat: now,
    exp: expiresAt,
  });
  const compactJwe = await new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM", typ: "JWT" })
    .encrypt(sessionKey);
  const encryptedSession = encryptedAdminSessionSchema.safeParse(compactJwe);

  if (!encryptedSession.success) {
    throw new AdminAuthError("session_too_large", {
      cause: encryptedSession.error,
    });
  }

  return sealedAdminSessionSchema.parse({
    value: encryptedSession.data,
    expiresAt,
  });
}

export async function decodeAdminSession(
  value: string | undefined,
): Promise<AdminSessionReadResult> {
  if (value === undefined) {
    return { kind: "missing" };
  }

  const encryptedSession = encryptedAdminSessionSchema.safeParse(value);
  if (!encryptedSession.success) {
    return { kind: "invalid" };
  }

  try {
    const decrypted = await jwtDecrypt(encryptedSession.data, sessionKey, {
      keyManagementAlgorithms: ["dir"],
      contentEncryptionAlgorithms: ["A256GCM"],
      typ: "JWT",
      requiredClaims: ["iat", "exp", "sub"],
    });
    if (
      decrypted.protectedHeader.alg !== "dir" ||
      decrypted.protectedHeader.enc !== "A256GCM" ||
      decrypted.protectedHeader.typ !== "JWT"
    ) {
      return { kind: "invalid" };
    }

    const parsedPayload = adminSessionPayloadSchema.safeParse(decrypted.payload);
    if (
      !parsedPayload.success ||
      parsedPayload.data.exp - parsedPayload.data.iat >
        env.ADMIN_SESSION_MAX_AGE_SECONDS
    ) {
      return { kind: "invalid" };
    }

    return { kind: "valid", session: parsedPayload.data };
  } catch (cause) {
    if (cause instanceof errors.JWTExpired) {
      return { kind: "expired" };
    }
    if (cause instanceof errors.JOSEError) {
      return { kind: "invalid" };
    }
    throw cause;
  }
}

export async function readAdminSession(): Promise<AdminSessionReadResult> {
  return decodeAdminSession(await readAdminSessionCookie());
}

export async function requireAdminSession(): Promise<AdminSessionPayload> {
  const result = await readAdminSession();

  switch (result.kind) {
    case "valid":
      return result.session;
    case "missing":
    case "invalid":
    case "expired":
      throw new AdminAuthError("authentication_required");
    default:
      result satisfies never;
      throw new AdminAuthError("authentication_required");
  }
}

/** Call only from a Route Handler or Server Action, where response cookies are mutable. */
export async function commitAdminSession(
  sealedSession: SealedAdminSession,
): Promise<void> {
  const parsedSession = sealedAdminSessionSchema.safeParse(sealedSession);
  if (!parsedSession.success) {
    throw new AdminAuthError("invalid_session_input", {
      cause: parsedSession.error,
    });
  }

  const maxAge = parsedSession.data.expiresAt - Math.floor(Date.now() / 1_000);
  if (maxAge <= 0 || maxAge > env.ADMIN_SESSION_MAX_AGE_SECONDS) {
    throw new AdminAuthError("invalid_cookie_lifetime");
  }

  await commitAdminSessionCookie(parsedSession.data.value, maxAge);
}

/** Call only from a Route Handler or Server Action, where response cookies are mutable. */
export async function clearAdminSession(): Promise<void> {
  await clearAdminSessionCookie();
}
