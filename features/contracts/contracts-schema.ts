import "server-only";

import { z } from "zod";

const contractDateSchema = z.union([z.iso.date(), z.iso.datetime()]);
const nullableContractDateSchema = contractDateSchema.nullable();
const nullableTimestampSchema = z.iso.datetime().nullable();

export const contractIdSchema = z.uuid().brand<"ContractId">();

export const contractStatusSchema = z.enum([
  "draft",
  "sent",
  "studentSigned",
  "hostSigned",
  "completed",
  "cancelled",
]);

export const contractSchema = z.strictObject({
  id: contractIdSchema,
  reservationId: z.uuid(),
  roomId: z.uuid(),
  studentId: z.uuid(),
  hostId: z.uuid(),
  contractStartDate: nullableContractDateSchema,
  contractEndDate: nullableContractDateSchema,
  depositKrw: z.number().int().nonnegative(),
  monthlyRentKrw: z.number().int().nonnegative(),
  maintenanceFeeKrw: z.number().int().nonnegative(),
  includedUtilities: z.array(z.string().min(1).max(200)).readonly().nullable(),
  specialTerms: z.string().max(10_000).nullable(),
  contractStatus: contractStatusSchema,
  contractFileUrl: z.string().max(4_000).nullable(),
  studentSignedAt: nullableTimestampSchema,
  hostSignedAt: nullableTimestampSchema,
  moveInDate: nullableTimestampSchema,
  checkinReminderSentAt: nullableTimestampSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: nullableTimestampSchema,
});

export const contractsSchema = z.array(contractSchema).readonly();

export type Contract = z.infer<typeof contractSchema>;
export type ContractId = z.infer<typeof contractIdSchema>;
export type ContractStatus = z.infer<typeof contractStatusSchema>;
