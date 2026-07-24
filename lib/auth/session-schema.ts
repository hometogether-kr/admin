import "server-only";

import { z } from "zod";

import { ADMIN_ROLES } from "@/lib/api/operations";

export const ADMIN_SESSION_VERSION = 1 as const;
export const MAX_ADMIN_SESSION_AGE_SECONDS = 604_800 as const;
export const MAX_ADMIN_SESSION_COOKIE_BYTES = 3_800 as const;

const sessionIdentityFields = {
  sub: z.uuid(),
  role: z.enum(ADMIN_ROLES),
  displayName: z.string().min(1).nullable(),
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
} as const;

export const adminSessionInputSchema = z
  .strictObject(sessionIdentityFields)
  .readonly();

export const adminSessionPayloadSchema = z
  .strictObject({
    v: z.literal(ADMIN_SESSION_VERSION),
    sid: z.uuid(),
    ...sessionIdentityFields,
    iat: z.number().int().nonnegative(),
    exp: z.number().int().positive(),
  })
  .superRefine((payload, context) => {
    const lifetime = payload.exp - payload.iat;
    if (lifetime <= 0 || lifetime > MAX_ADMIN_SESSION_AGE_SECONDS) {
      context.addIssue({
        code: "custom",
        path: ["exp"],
        message: "Session lifetime is outside the supported range",
      });
    }
  })
  .readonly();

export const refreshLifetimeMetadataSchema = z
  .object({
    iat: z.number().int().nonnegative(),
    exp: z.number().int().positive(),
  })
  .superRefine((metadata, context) => {
    if (metadata.exp <= metadata.iat) {
      context.addIssue({
        code: "custom",
        path: ["exp"],
        message: "Refresh expiry must follow its issue time",
      });
    }
  })
  .readonly();

export const encryptedAdminSessionSchema = z
  .string()
  .min(1)
  .superRefine((value, context) => {
    if (new TextEncoder().encode(value).byteLength > MAX_ADMIN_SESSION_COOKIE_BYTES) {
      context.addIssue({
        code: "custom",
        message: "Encrypted session exceeds the cookie byte limit",
      });
    }
  })
  .brand<"EncryptedAdminSession">();

export const sealedAdminSessionSchema = z
  .strictObject({
    value: encryptedAdminSessionSchema,
    expiresAt: z.number().int().positive(),
  })
  .readonly();

export type AdminSessionInput = z.infer<typeof adminSessionInputSchema>;
export type AdminSessionPayload = z.infer<typeof adminSessionPayloadSchema>;
export type EncryptedAdminSession = z.infer<typeof encryptedAdminSessionSchema>;
export type SealedAdminSession = z.infer<typeof sealedAdminSessionSchema>;
