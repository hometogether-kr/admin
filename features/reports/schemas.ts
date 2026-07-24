import "server-only";

import { z } from "zod";

import { adminPaginatedSchema } from "@/lib/api/pagination-schema";
import {
  REPORT_RESOLUTION_STATUSES,
  REPORT_STATUSES,
  REPORT_TARGET_TYPES,
  type ReportStatus,
  type ReportTargetType,
} from "@/features/reports/constants";

const reportTimestampSchema = z.iso.datetime({ offset: true });

export const reportIdSchema = z.uuid();

export const reportSchema = z
  .strictObject({
    id: reportIdSchema,
    reporterId: z.uuid(),
    targetType: z.enum(REPORT_TARGET_TYPES),
    targetId: z.uuid(),
    reason: z.string().min(10).max(1_000),
    status: z.enum(REPORT_STATUSES),
    evidenceUrls: z.array(z.string().max(2_000)).max(5).readonly(),
    resolutionMemo: z.string().max(1_000).nullable(),
    resolvedBy: z.uuid().nullable(),
    resolvedAt: reportTimestampSchema.nullable(),
    createdAt: reportTimestampSchema,
    updatedAt: reportTimestampSchema,
    deletedAt: reportTimestampSchema.nullable(),
  })
  .readonly();

export type Report = z.output<typeof reportSchema>;

export const reportListSchema = adminPaginatedSchema(reportSchema);

export type ReportList = z.output<typeof reportListSchema>;

export type ReportListQuery = {
  readonly limit: number;
  readonly page: number;
  readonly status: ReportStatus | undefined;
  readonly targetType: ReportTargetType | undefined;
};

const positivePageSchema = z
  .string()
  .regex(/^[1-9][0-9]*$/u)
  .transform(Number)
  .pipe(z.number().int().positive().max(1_000_000));

const reportListQuerySchema = z.strictObject({
  page: positivePageSchema.optional(),
  limit: z.enum(["10", "20", "50", "100"]).transform(Number).optional(),
  status: z.union([z.literal(""), z.enum(REPORT_STATUSES)]).optional(),
  targetType: z.union([z.literal(""), z.enum(REPORT_TARGET_TYPES)]).optional(),
});

export function parseReportListQuery(value: unknown): ReportListQuery {
  const parsed = reportListQuerySchema.safeParse(value);
  if (!parsed.success) {
    return { limit: 20, page: 1, status: undefined, targetType: undefined };
  }
  return {
    limit: parsed.data.limit ?? 20,
    page: parsed.data.page ?? 1,
    status: parsed.data.status === "" ? undefined : parsed.data.status,
    targetType:
      parsed.data.targetType === "" ? undefined : parsed.data.targetType,
  };
}

export const resolveReportFormSchema = z.strictObject({
  reportId: reportIdSchema,
  status: z.enum(REPORT_RESOLUTION_STATUSES),
  memo: z.string().max(1_000),
});

const httpsEvidenceUrlSchema = z.url({
  normalize: true,
  protocol: /^https$/u,
});

export function parseHttpsEvidenceUrl(value: string): string | null {
  const parsed = httpsEvidenceUrlSchema.safeParse(value);
  if (!parsed.success) return null;
  const url = new URL(parsed.data);
  if (url.username.length > 0 || url.password.length > 0) return null;
  return url.href;
}

export function formatEvidenceUrlForDisplay(value: string): string {
  if (!URL.canParse(value)) return value;
  const url = new URL(value);
  if (url.username.length === 0 && url.password.length === 0) return value;
  url.username = "";
  url.password = "";
  return url.href;
}
