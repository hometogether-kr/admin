import "server-only";

const AUTH_ERROR_MESSAGES = {
  authentication_required: "Administrator authentication is required.",
  expired_refresh_metadata: "The refresh lifetime has expired.",
  invalid_cookie_lifetime: "The session cookie lifetime is invalid.",
  invalid_refresh_metadata: "The refresh lifetime metadata is invalid.",
  invalid_session_input: "The administrator session input is invalid.",
  session_too_large: "The encrypted administrator session is too large.",
} as const;

export type AdminAuthErrorCode = keyof typeof AUTH_ERROR_MESSAGES;

export class AdminAuthError extends Error {
  readonly name = "AdminAuthError";

  constructor(
    readonly code: AdminAuthErrorCode,
    options?: ErrorOptions,
  ) {
    super(AUTH_ERROR_MESSAGES[code], options);
  }
}
