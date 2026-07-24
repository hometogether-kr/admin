import "server-only";

import { cookies } from "next/headers";
import { z } from "zod";

import type { EncryptedAdminSession } from "@/lib/auth/session-schema";
import { env } from "@/lib/env";

export const ADMIN_SESSION_COOKIE_NAMES = {
  production: "__Host-hometogether_admin_session",
  development: "hometogether_admin_session",
} as const;

const production = env.NODE_ENV === "production";

export const ADMIN_SESSION_COOKIE = {
  name: production
    ? ADMIN_SESSION_COOKIE_NAMES.production
    : ADMIN_SESSION_COOKIE_NAMES.development,
  options: {
    httpOnly: true,
    secure: production,
    sameSite: "lax",
    path: "/",
    priority: "high",
  },
} as const;

const cookieMaxAgeSchema = z
  .number()
  .int()
  .min(1)
  .max(env.ADMIN_SESSION_MAX_AGE_SECONDS);

export async function readAdminSessionCookie(): Promise<string | undefined> {
  return (await cookies()).get(ADMIN_SESSION_COOKIE.name)?.value;
}

export async function commitAdminSessionCookie(
  value: EncryptedAdminSession,
  maxAge: number,
): Promise<void> {
  const boundedMaxAge = cookieMaxAgeSchema.parse(maxAge);
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_SESSION_COOKIE.name,
    value,
    ...ADMIN_SESSION_COOKIE.options,
    maxAge: boundedMaxAge,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_SESSION_COOKIE.name,
    value: "",
    ...ADMIN_SESSION_COOKIE.options,
    expires: new Date(0),
    maxAge: 0,
  });
}
