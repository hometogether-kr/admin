import "server-only";

import { z } from "zod";

import {
  supportInquiryTypeSchema,
  supportStatusSchema,
} from "@/features/supports/schema";

export type SupportSearchParams = Readonly<
  Record<string, string | readonly string[] | undefined>
>;

function scalarQueryValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

const positiveIntegerQuerySchema = z.preprocess(
  scalarQueryValue,
  z
    .string()
    .regex(/^[1-9][0-9]*$/u)
    .transform(Number)
    .pipe(z.number().safe().int().positive())
    .catch(1),
);

const supportListQuerySchema = z
  .strictObject({
    status: z.preprocess(
      scalarQueryValue,
      supportStatusSchema.optional().catch(undefined),
    ),
    inquiryType: z.preprocess(
      scalarQueryValue,
      supportInquiryTypeSchema.optional().catch(undefined),
    ),
    page: positiveIntegerQuerySchema,
    limit: z.preprocess(
      scalarQueryValue,
      z
        .string()
        .regex(/^[1-9][0-9]*$/u)
        .transform(Number)
        .pipe(z.number().safe().int().positive().max(100))
        .catch(20),
    ),
  })
  .readonly();

export type SupportListQuery = z.output<typeof supportListQuerySchema>;

export function parseSupportListQuery(
  searchParams: SupportSearchParams,
): SupportListQuery {
  return supportListQuerySchema.parse({
    status: searchParams.status,
    inquiryType: searchParams.inquiryType,
    page: searchParams.page,
    limit: searchParams.limit,
  });
}

export function supportListHref(
  query: SupportListQuery,
  page: number,
): string {
  const search = new URLSearchParams({
    page: String(page),
    limit: String(query.limit),
  });
  if (query.status !== undefined) search.set("status", query.status);
  if (query.inquiryType !== undefined) {
    search.set("inquiryType", query.inquiryType);
  }
  return `/supports?${search.toString()}`;
}
