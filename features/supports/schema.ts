import "server-only";

import { z } from "zod";

import { adminSimplePaginatedSchema } from "@/lib/api/pagination-schema";

export const SUPPORT_STATUS_VALUES = [
  "pending",
  "investigating",
  "resolved",
  "dismissed",
] as const;

export const SUPPORT_INQUIRY_TYPE_VALUES = [
  "directTrade",
  "payment",
  "contract",
  "room",
  "other",
] as const;

export const supportStatusSchema = z.enum(SUPPORT_STATUS_VALUES);
export const supportInquiryTypeSchema = z.enum(SUPPORT_INQUIRY_TYPE_VALUES);
export const supportIdSchema = z.uuid();

export const supportSchema = z
  .strictObject({
    id: supportIdSchema,
    userId: z.uuid().nullable(),
    inquiryType: supportInquiryTypeSchema,
    status: supportStatusSchema,
    body: z
      .string()
      .min(1)
      .max(2_000)
      .refine((value) => value.trim().length > 0, {
        message: "Support body must contain non-whitespace content",
      }),
    resolution: z.string().max(2_000).nullable(),
    evidenceUrls: z.array(z.string().min(1)).readonly(),
    adminNote: z.string().max(2_000).nullable(),
    resolvedBy: z.uuid().nullable(),
    resolvedAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .readonly();

export const supportListSchema = adminSimplePaginatedSchema(supportSchema)
  .superRefine((response, context) => {
    if (response.limit > 100) {
      context.addIssue({
        code: "custom",
        message: "Support page limit exceeds the API contract",
        path: ["limit"],
      });
    }
  });

export type Support = z.output<typeof supportSchema>;
export type SupportStatus = z.output<typeof supportStatusSchema>;
export type SupportInquiryType = z.output<typeof supportInquiryTypeSchema>;
export type SupportList = z.output<typeof supportListSchema>;
