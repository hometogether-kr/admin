import "server-only";

import { z } from "zod";

import { ADMIN_ROLES } from "@/lib/api/operations";
import { env } from "@/lib/env";

export const KAKAO_STATE_COOKIE_NAME = "kakao_oauth_state";
export const KAKAO_CALLBACK_PATH = "/auth/kakao/callback";

const KAKAO_AUTHORIZE_ORIGIN = "https://kauth.kakao.com";
const KAKAO_AUTHORIZE_PATH = "/oauth/authorize";
const LOOPBACK_HOSTNAMES = ["127.0.0.1", "localhost", "[::1]"] as const;
const USER_ROLES = ["student", "host", ...ADMIN_ROLES] as const;
const callbackCodeSchema = z
  .string()
  .min(1)
  .max(2_048)
  .regex(/^[^\u0000-\u001f\u007f]+$/u);
const oauthStateSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/u);

export const callbackEnvelopeSchema = z
  .strictObject({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
    onboardingRequired: z.boolean(),
    user: z
      .strictObject({
        id: z.uuid(),
        role: z.enum(USER_ROLES),
        name: z.string().min(1).nullable(),
        email: z.email().nullable(),
        phone: z.string().regex(/^\+8210\d{8}$/u).nullable(),
        introduction: z.string().min(1).max(1_000).nullable(),
        onboardingCompletedAt: z.iso.datetime().nullable(),
      })
      .readonly(),
  })
  .readonly();

export type KakaoCallbackInput = {
  readonly code: string;
  readonly state: string;
  readonly stateCookie: string;
};

function isLoopback(url: URL): boolean {
  return LOOPBACK_HOSTNAMES.some((hostname) => hostname === url.hostname);
}

function parseCallbackQuery(
  url: URL,
): { readonly code: string; readonly state: string } | null {
  const entries = [...url.searchParams.entries()];
  const codes = url.searchParams.getAll("code");
  const states = url.searchParams.getAll("state");
  if (
    entries.length !== 2 ||
    codes.length !== 1 ||
    states.length !== 1 ||
    entries.some(([key]) => key !== "code" && key !== "state")
  ) {
    return null;
  }

  const parsed = z
    .strictObject({ code: callbackCodeSchema, state: oauthStateSchema })
    .safeParse({ code: codes[0], state: states[0] });
  return parsed.success ? parsed.data : null;
}

function exactCookieAttributes(
  rawCookie: string,
  expected: readonly string[],
): boolean {
  const attributes = rawCookie
    .split(";")
    .slice(1)
    .map((part) => part.trim());
  return (
    attributes.length === expected.length &&
    new Set(attributes).size === attributes.length &&
    expected.every((attribute) => attributes.includes(attribute))
  );
}

function stateCookieSecureAttribute(): readonly string[] {
  return new URL(env.ADMIN_API_BASE_URL).protocol === "https:" ? ["Secure"] : [];
}

function validStateClearCookie(rawCookie: string): boolean {
  return (
    rawCookie.split(";")[0] === `${KAKAO_STATE_COOKIE_NAME}=` &&
    exactCookieAttributes(rawCookie, [
      "Max-Age=0",
      `Path=${KAKAO_CALLBACK_PATH}`,
      "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      "HttpOnly",
      ...stateCookieSecureAttribute(),
      "SameSite=Lax",
    ])
  );
}

export function validatedOAuthLocation(value: string | null): string | null {
  if (value === null || !URL.canParse(value)) return null;
  const location = new URL(value);
  if (location.username || location.password || location.hash) return null;
  if (
    location.origin === KAKAO_AUTHORIZE_ORIGIN &&
    location.pathname === KAKAO_AUTHORIZE_PATH
  ) {
    return location.href;
  }

  const apiBase = new URL(env.ADMIN_API_BASE_URL);
  const adminOrigin = new URL(env.ADMIN_PUBLIC_ORIGIN);
  const mockCallbackAllowed =
    env.NODE_ENV !== "production" &&
    isLoopback(apiBase) &&
    isLoopback(adminOrigin) &&
    location.origin === adminOrigin.origin &&
    location.pathname === KAKAO_CALLBACK_PATH &&
    parseCallbackQuery(location) !== null;
  return mockCallbackAllowed ? location.href : null;
}

export function validStateSetCookie(rawCookie: string): boolean {
  const [pair = ""] = rawCookie.split(";");
  const prefix = `${KAKAO_STATE_COOKIE_NAME}=`;
  const value = pair.startsWith(prefix) ? pair.slice(prefix.length) : "";
  return (
    oauthStateSchema.safeParse(value).success &&
    exactCookieAttributes(rawCookie, [
      "Max-Age=600",
      `Path=${KAKAO_CALLBACK_PATH}`,
      "HttpOnly",
      ...stateCookieSecureAttribute(),
      "SameSite=Lax",
    ])
  );
}

export function upstreamClearCookie(headers: Headers): string | undefined {
  const cookies = headers.getSetCookie();
  return cookies.length === 1 && validStateClearCookie(cookies[0])
    ? cookies[0]
    : undefined;
}

export function localKakaoStateClearCookie(): string {
  return [
    `${KAKAO_STATE_COOKIE_NAME}=`,
    "Max-Age=0",
    `Path=${KAKAO_CALLBACK_PATH}`,
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "HttpOnly",
    ...stateCookieSecureAttribute(),
    "SameSite=Lax",
  ].join("; ");
}

export function parseKakaoCallbackRequest(
  request: Request,
): KakaoCallbackInput | null {
  const query = parseCallbackQuery(new URL(request.url));
  const matches = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.startsWith(`${KAKAO_STATE_COOKIE_NAME}=`));
  const stateCookie =
    matches.length === 1
      ? matches[0].slice(KAKAO_STATE_COOKIE_NAME.length + 1)
      : "";
  if (
    query === null ||
    !oauthStateSchema.safeParse(stateCookie).success ||
    query.state !== stateCookie
  ) {
    return null;
  }
  return { ...query, stateCookie };
}
