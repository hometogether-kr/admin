import "server-only";

import { z } from "zod";

import {
  NOTIFICATION_TEMPLATES,
  RESERVATION_STATUSES,
} from "@/features/reservations/constants";
import type { ReservationListQuery } from "@/features/reservations/list-filter";

const nullableText = z.string().nullable().optional();
const nullableDate = z
  .union([z.iso.date(), z.iso.datetime()])
  .nullable()
  .optional();

const checkoutChecklistSchema = z
  .object({
    keysReturned: z.boolean().optional(),
    utilitiesPaid: z.boolean().optional(),
    cleaningCompleted: z.boolean().optional(),
    damagesNone: z.boolean().optional(),
  })
  .readonly();

const checkoutDataSchema = z
  .object({
    checklist: checkoutChecklistSchema,
    notes: z.string().max(1_000).nullable().optional(),
  })
  .readonly();

export const reservationIdSchema = z.uuid();
export const reservationStatusSchema = z.enum(RESERVATION_STATUSES);
export const notificationTemplateSchema = z.enum(NOTIFICATION_TEMPLATES);

const reservationSchemaShape = {
  id: reservationIdSchema,
  roomId: reservationIdSchema,
  studentId: reservationIdSchema,
  hostId: reservationIdSchema,
  desiredMoveInDate: nullableDate,
  desiredStayMonths: z.number().int().nonnegative().nullable().optional(),
  visitRequestDate1: nullableDate,
  visitRequestDate2: nullableDate,
  visitRequestDate3: nullableDate,
  studentMessage: nullableText,
  studentIntroSnapshot: nullableText,
  reservationStatus: reservationStatusSchema,
  hostResponseAt: nullableDate,
  visitScheduledAt: nullableDate,
  visitReminderSentAt: nullableDate,
  visitCompletedAt: nullableDate,
  rejectReason: nullableText,
  rejectMessage: nullableText,
  checkoutData: checkoutDataSchema.nullable().optional(),
  checkoutConfirmedAt: nullableDate,
  contractIntent: nullableText,
  contractIntentRequestedAt: nullableDate,
  expiresAt: nullableDate,
  createdAt: nullableDate,
  updatedAt: nullableDate,
  deletedAt: nullableDate,
} as const;

export const reservationSchema = z
  .object(reservationSchemaShape)
  .readonly();

export const reservationsSchema = z.array(reservationSchema).readonly();

const reservationListQuerySchema = z.strictObject({
  status: z
    .union([z.literal(""), reservationStatusSchema])
    .optional(),
});

export function parseReservationListQuery(value: unknown): ReservationListQuery {
  const parsed = reservationListQuerySchema.safeParse(value);
  if (!parsed.success || parsed.data.status === "") {
    return { status: undefined };
  }
  return { status: parsed.data.status };
}

export type Reservation = z.infer<typeof reservationSchema>;
