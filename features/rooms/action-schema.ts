import { z } from "zod";

import { ROOM_NOTIFICATION_TEMPLATES } from "@/features/rooms/constants";

export const roomIdSchema = z.uuid();
export const mediaIdSchema = z.uuid();

export const reasonSchema = z.string().trim().min(1).max(1_000);
export const revisionMessageSchema = z.string().trim().min(1).max(2_000);
export const notificationTemplateSchema = z.enum(ROOM_NOTIFICATION_TEMPLATES);
export const addressHiddenSchema = z.enum(["true", "false"])
  .transform((value) => value === "true");
export const memoSchema = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? null : value,
  z.string().trim().max(2_000).nullable(),
);

const currencyStringSchema = (minimum: number, maximum: number) => z.string()
  .trim()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().min(minimum).max(maximum));

export const roomCoreUpdateFormSchema = z.strictObject({
  monthlyRentKrw: currencyStringSchema(1, 100_000_000),
  depositKrw: currencyStringSchema(0, 1_000_000_000),
  maintenanceFeeKrw: currencyStringSchema(0, 1_000_000_000),
  description: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? null : value,
    z.string().trim().max(2_000).nullable(),
  ),
});
