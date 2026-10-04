import { z } from "zod";

import { legacyRoomSchema } from "@/features/rooms/legacy-schema";
import { registrationRoomSchema } from "@/features/rooms/registration-schema";

export const roomDetailSchema = z.discriminatedUnion(
  "registrationContractVersion",
  [registrationRoomSchema, legacyRoomSchema],
);

export const roomMutationResponseSchema = z.object({
  id: z.uuid(),
}).readonly();

export const roomPropertyMutationResponseSchema = z.strictObject({
  roomId: z.uuid(), title: z.string().nullable(), subtitle: z.string().nullable(),
  floor: z.number().int().nullable(), addressVerifiedAt: z.iso.datetime().nullable(),
}).readonly();

export type RoomDetail = z.infer<typeof roomDetailSchema>;
