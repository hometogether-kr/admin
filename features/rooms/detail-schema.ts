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

export type RoomDetail = z.infer<typeof roomDetailSchema>;
