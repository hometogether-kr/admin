import "server-only";

import { readAdminApi } from "@/lib/api/client";
import { roomDetailSchema } from "@/features/rooms/detail-schema";
import {
  roomListResponseSchema,
  type RoomSearch,
} from "@/features/rooms/list-schema";

export async function readRooms(search: RoomSearch, returnTo: string) {
  return readAdminApi({
    operationId: "ROM-01",
    query: search,
    responseSchema: roomListResponseSchema,
    returnTo,
  });
}
export async function readRoom(roomId: string) {
  return readAdminApi({
    operationId: "ROM-02",
    pathParameters: { id: roomId },
    responseSchema: roomDetailSchema,
    returnTo: `/rooms/${roomId}`,
  });
}
