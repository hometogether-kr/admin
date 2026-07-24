import { z } from "zod";

export const PAYMENT_TYPES = [
  "reservationFee",
  "contractFee",
  "serviceFee",
  "careFee",
  "deposit",
  "rent",
  "maintenanceFee",
  "cleaningFee",
] as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "requested",
  "completed",
  "failed",
  "cancelled",
  "refundRequested",
  "refundCompleted",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const paymentDateSchema = z.iso.datetime();

export const paymentIdSchema = z.uuid();

export const paymentSchema = z
  .strictObject({
    id: paymentIdSchema,
    reservationId: paymentIdSchema,
    studentId: paymentIdSchema,
    hostId: paymentIdSchema,
    paymentType: z.enum(PAYMENT_TYPES),
    amountKrw: z.number().int().nonnegative(),
    paymentStatus: z.enum(PAYMENT_STATUSES),
    pgProvider: z.string().nullable(),
    pgTransactionId: z.string().nullable(),
    paidAt: paymentDateSchema.nullable(),
    refundedAt: paymentDateSchema.nullable(),
    createdAt: paymentDateSchema,
    updatedAt: paymentDateSchema,
    deletedAt: paymentDateSchema.nullable(),
  })
  .readonly();

export type Payment = z.infer<typeof paymentSchema>;

export const paymentsSchema = z.array(paymentSchema).readonly();
