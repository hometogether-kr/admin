import "server-only";

import { z } from "zod";

const PRODUCTION_API_ORIGIN = "https://api.hometogether.kr";
const PRODUCTION_ADMIN_ORIGIN = "https://admin.hometogether.kr";
const LOOPBACK_HOSTNAMES = ["127.0.0.1", "localhost", "[::1]"] as const;

const originSchema = z.url().superRefine((value, context) => {
  const url = new URL(value);

  if (url.username || url.password) {
    context.addIssue({ code: "custom", message: "URL credentials are forbidden" });
  }
  if (url.search) {
    context.addIssue({ code: "custom", message: "URL query parameters are forbidden" });
  }
  if (url.hash) {
    context.addIssue({ code: "custom", message: "URL fragments are forbidden" });
  }
  if (url.pathname !== "/") {
    context.addIssue({ code: "custom", message: "URL paths are forbidden" });
  }
});

const base64UrlKeySchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]+$/, "Secret must use unpadded base64url encoding")
  .superRefine((value, context) => {
    const decoded = Buffer.from(value, "base64url");
    if (decoded.toString("base64url") !== value || decoded.byteLength !== 32) {
      context.addIssue({
        code: "custom",
        message: "Secret must decode to exactly 32 bytes",
      });
    }
  })
  .brand<"AdminSessionSecret">();

const base64AesKeySchema = z
  .string()
  .regex(
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/,
    "Server Actions key must use base64 encoding",
  )
  .superRefine((value, context) => {
    const decoded = Buffer.from(value, "base64");
    const validLength = [16, 24, 32].some((length) => decoded.byteLength === length);
    if (decoded.toString("base64") !== value || !validLength) {
      context.addIssue({
        code: "custom",
        message: "Server Actions key must decode to a valid AES key length",
      });
    }
  })
  .brand<"ServerActionsEncryptionKey">();

const maxAgeSchema = z
  .string()
  .regex(/^[1-9]\d*$/, "Session max age must be a positive integer")
  .transform(Number)
  .pipe(z.number().int().max(604_800));

const environmentSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    ADMIN_API_BASE_URL: originSchema.brand<"AdminApiBaseUrl">(),
    ADMIN_PUBLIC_ORIGIN: originSchema.brand<"AdminPublicOrigin">(),
    ADMIN_SESSION_SECRET: base64UrlKeySchema,
    ADMIN_SESSION_MAX_AGE_SECONDS: maxAgeSchema,
    NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: base64AesKeySchema,
  })
  .superRefine((environment, context) => {
    const origins = [
      ["ADMIN_API_BASE_URL", environment.ADMIN_API_BASE_URL, PRODUCTION_API_ORIGIN],
      ["ADMIN_PUBLIC_ORIGIN", environment.ADMIN_PUBLIC_ORIGIN, PRODUCTION_ADMIN_ORIGIN],
    ] as const;

    for (const [field, value, productionOrigin] of origins) {
      const url = new URL(value);
      const isProductionOrigin = url.origin === productionOrigin;
      const isLoopbackHttp =
        environment.NODE_ENV !== "production" &&
        url.protocol === "http:" &&
        LOOPBACK_HOSTNAMES.some((hostname) => hostname === url.hostname);

      if (!isProductionOrigin && !isLoopbackHttp) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: "Origin is not approved for this environment",
        });
      }
    }
  })
  .readonly();

export type AdminEnvironment = z.infer<typeof environmentSchema>;

export const env: AdminEnvironment = environmentSchema.parse(process.env);
