import "server-only";
import { z } from "zod";
import { adminPaginatedSchema } from "@/lib/api/pagination-schema";

const guestRegionRequestSchema = z
  .strictObject({
    id: z.uuid(),
    region: z.string().min(1).max(100),
    createdAt: z.iso.datetime(),
  })
  .readonly();

export const guestRegionRequestListSchema = adminPaginatedSchema(
  guestRegionRequestSchema,
).superRefine((response, context) => {
  if (response.limit > 100) {
    context.addIssue({
      code: "custom",
      message: "Guest region page limit exceeds the API contract",
      path: ["limit"],
    });
  }
});

export type GuestRegionRequestList = z.output<
  typeof guestRegionRequestListSchema
>;
