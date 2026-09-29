import { z } from "zod";

import {
  HOST_CONSULTATION_HOUSING_TYPES,
  HOST_CONSULTATION_REGION_TYPES,
  HOST_CONSULTATION_STATUSES,
  type HostConsultationHousingType,
  type HostConsultationRegionType,
  type HostConsultationStatus,
} from "./constants";

export type HostConsultationSearchParams = Readonly<
  Record<string, string | readonly string[] | undefined>
>;

export type HostConsultationListQuery = {
  readonly housingType: HostConsultationHousingType | undefined;
  readonly limit: number;
  readonly page: number;
  readonly regionType: HostConsultationRegionType | undefined;
  readonly status: HostConsultationStatus | undefined;
};

function scalarQueryValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

const positiveIntegerSchema = z.preprocess(
  scalarQueryValue,
  z
    .string()
    .regex(/^[1-9][0-9]*$/u)
    .transform(Number)
    .pipe(z.number().safe().int().positive()),
);

const hostConsultationListQuerySchema = z.strictObject({
  housingType: z.preprocess(
    scalarQueryValue,
    z.enum(HOST_CONSULTATION_HOUSING_TYPES).optional().catch(undefined),
  ),
  limit: positiveIntegerSchema.pipe(z.number().max(100)).catch(20),
  page: positiveIntegerSchema.catch(1),
  regionType: z.preprocess(
    scalarQueryValue,
    z.enum(HOST_CONSULTATION_REGION_TYPES).optional().catch(undefined),
  ),
  status: z.preprocess(
    scalarQueryValue,
    z.enum(HOST_CONSULTATION_STATUSES).optional().catch(undefined),
  ),
});

export function parseHostConsultationListQuery(
  searchParams: HostConsultationSearchParams,
): HostConsultationListQuery {
  const parsed = hostConsultationListQuerySchema.parse({
    housingType: searchParams.housingType,
    limit: searchParams.limit,
    page: searchParams.page,
    regionType: searchParams.regionType,
    status: searchParams.status,
  });
  return {
    housingType: parsed.housingType,
    limit: parsed.limit,
    page: parsed.page,
    regionType: parsed.regionType,
    status: parsed.status,
  };
}

export function hostConsultationListHref(
  query: HostConsultationListQuery,
  page: number,
): string {
  const search = new URLSearchParams({
    page: String(page),
    limit: String(query.limit),
  });
  if (query.regionType !== undefined) {
    search.set("regionType", query.regionType);
  }
  if (query.housingType !== undefined) {
    search.set("housingType", query.housingType);
  }
  if (query.status !== undefined) search.set("status", query.status);
  return `/host-consultations?${search.toString()}`;
}

export function hostConsultationCanonicalPage(
  requestedPage: number,
  totalPages: number,
): number {
  return Math.min(requestedPage, Math.max(1, totalPages));
}
