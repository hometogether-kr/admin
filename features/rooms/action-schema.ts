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
