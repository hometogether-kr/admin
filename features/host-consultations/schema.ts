import "server-only";

import { z } from "zod";

import { adminPaginatedSchema } from "@/lib/api/pagination-schema";
import {
  HOST_CONSULTATION_HOUSING_TYPES,
  HOST_CONSULTATION_REGION_TYPES,
  HOST_CONSULTATION_STATUSES,
} from "@/features/host-consultations/constants";

export const hostConsultationIdSchema = z.uuid();

export const hostConsultationSchema = z
  .strictObject({
    id: hostConsultationIdSchema,
    userId: z.uuid().nullable(),
    regionType: z.enum(HOST_CONSULTATION_REGION_TYPES),
    regionId: z.uuid().nullable(),
    regionName: z.string().min(1).max(160),
    customUniversityName: z.string().min(1).max(160).nullable(),
    customSubwayName: z.string().min(1).max(160).nullable(),
    roomCount: z.number().int().min(1).max(3),
    hasAirConditioner: z.boolean(),
    housingType: z.enum(HOST_CONSULTATION_HOUSING_TYPES),
    phone: z.string().min(1).max(40),
    normalizedPhone: z.string().min(1).max(20),
    privacyConsentAgreed: z.literal(true),
    privacyConsentAgreedAt: z.iso.datetime(),
    privacyConsentVersion: z.string().min(1).max(80),
    source: z.string().min(1).max(80),
    status: z.enum(HOST_CONSULTATION_STATUSES),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .readonly();

export const hostConsultationListSchema = adminPaginatedSchema(
  hostConsultationSchema,
).superRefine((response, context) => {
  if (response.limit > 100) {
    context.addIssue({
      code: "custom",
      message: "Host consultation page limit exceeds the API contract",
      path: ["limit"],
    });
  }
});

export type HostConsultation = z.output<typeof hostConsultationSchema>;
export type HostConsultationList = z.output<
  typeof hostConsultationListSchema
>;
