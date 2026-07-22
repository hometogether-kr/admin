import { z } from "zod";

import { adminPaginatedSchema } from "@/lib/api/pagination-schema";
import { ROOM_STATUSES } from "@/features/rooms/constants";

export const roomStatusSchema = z.enum(ROOM_STATUSES);

export const roomListItemSchema = z
  .object({
    id: z.uuid(),
    hostId: z.uuid(),
    title: z.string().nullable(),
    addressRegion: z.string().nullable(),
    roomStatus: roomStatusSchema,
    isPublic: z.boolean(),
    updatedAt: z.iso.datetime(),
  })
  .readonly();

export const roomListResponseSchema = adminPaginatedSchema(roomListItemSchema);

const optionalHostIdSchema = z.preprocess(
  (value) => value === "" ? undefined : value,
  z.uuid().optional(),
);

const optionalStatusSchema = z.preprocess(
  (value) => value === "" ? undefined : value,
  roomStatusSchema.optional(),
);

const roomSearchSchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: optionalStatusSchema,
  hostId: optionalHostIdSchema,
});

export type RoomListItem = z.infer<typeof roomListItemSchema>;
export type RoomListResponse = z.infer<typeof roomListResponseSchema>;
export type RoomSearch = z.infer<typeof roomSearchSchema>;
export type RoomSearchInput = Readonly<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
export function parseRoomSearch(input: RoomSearchInput) {
  return roomSearchSchema.safeParse({
    page: firstValue(input.page),
    limit: firstValue(input.limit),
    status: firstValue(input.status),
    hostId: firstValue(input.hostId),
  });
}

export function roomListHref(search: RoomSearch, page: number): string {
  const parameters = new URLSearchParams({
    page: String(page),
    limit: String(search.limit),
  });
  if (search.status !== undefined) parameters.set("status", search.status);
  if (search.hostId !== undefined) parameters.set("hostId", search.hostId);
  return `/rooms?${parameters.toString()}`;
}
