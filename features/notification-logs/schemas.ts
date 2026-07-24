import { z } from "zod";

const maskedPhoneSchema = z
  .string()
  .regex(/^\d{3}-\*{4}-\d{4}$/u, "알림 대상 전화번호 마스킹 형식이 아닙니다.")
  .nullable();

const isoDateSchema = z.string().datetime({ offset: true }).nullable();

export const notificationChannelSchema = z.enum([
  "alimtalk",
  "sms",
  "email",
  "kakaoChannel",
]);

export const notificationSendStatusSchema = z.enum([
  "pending",
  "sent",
  "failed",
]);

export const notificationLogSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid().nullable(),
    targetPhone: maskedPhoneSchema,
    channel: notificationChannelSchema,
    templateCode: z.string().min(1).max(200),
    messageData: z.record(z.string(), z.string()),
    sendStatus: notificationSendStatusSchema,
    attempts: z.number().int().nonnegative(),
    lastAttemptedAt: isoDateSchema,
    sentAt: isoDateSchema,
    failedReason: z.string().max(4_000).nullable(),
    createdAt: z.string().datetime({ offset: true }),
  })
  .strict();

export const notificationLogsResponseSchema = z
  .object({
    items: z.array(notificationLogSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().min(1),
    limit: z.number().int().min(1).max(100),
  })
  .strict();

export type NotificationLog = z.infer<typeof notificationLogSchema>;
export type NotificationLogsResponse = z.infer<
  typeof notificationLogsResponseSchema
>;
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;
export type NotificationSendStatus = z.infer<
  typeof notificationSendStatusSchema
>;

const notificationListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .strict();

type NotificationListSearchParams = Readonly<{
  readonly page?: string | readonly string[];
  readonly limit?: string | readonly string[];
}>;

export type NotificationListQuery = Readonly<{
  readonly page: number;
  readonly limit: number;
}>;

export function parseNotificationListQuery(
  searchParams: NotificationListSearchParams,
): NotificationListQuery | null {
  const page = searchParams.page;
  const limit = searchParams.limit;
  if (page !== undefined && typeof page !== "string") return null;
  if (limit !== undefined && typeof limit !== "string") return null;

  const parsed = notificationListQuerySchema.safeParse({ page, limit });
  return parsed.success ? parsed.data : null;
}

export const notificationLogIdSchema = z.uuid();
