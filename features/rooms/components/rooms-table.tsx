import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { TableShell } from "@/components/ui/table-shell";
import { formatDate } from "@/features/rooms/format";
import type { RoomListItem } from "@/features/rooms/list-schema";
import { RoomStatusBadge } from "@/features/rooms/components/room-status-badge";

const columns = [
  { key: "title", label: "제목" },
  { key: "roomId", label: "방\u00a0ID" },
  { key: "status", label: "상태" },
  { key: "hostId", label: "호스트\u00a0ID" },
  { key: "region", label: "지역" },
  { key: "public", label: "공개" },
  { key: "updated", label: "수정일" },
] as const;

type RoomsTableProps = { readonly rooms: readonly RoomListItem[] };

export function RoomsTable({ rooms }: RoomsTableProps) {
  return (
    <TableShell
      caption="방 관리 목록"
      columns={columns}
      rows={rooms.map((room) => ({
        key: room.id,
        cells: [
          <Link
            className="admin-focus whitespace-nowrap font-semibold text-brand hover:underline"
            href={`/rooms/${room.id}`}
            key={`${room.id}-title`}
          >
            {room.title ?? "제목 없음"}
          </Link>,
          <span
            className="admin-break-anywhere font-mono tabular-nums"
            key={`${room.id}-id`}
          >
            {room.id}
          </span>,
          <RoomStatusBadge key={`${room.id}-status`} status={room.roomStatus} />,
          <span
            className="admin-break-anywhere font-mono tabular-nums"
            key={`${room.id}-host`}
          >
            {room.hostId}
          </span>,
          room.addressRegion ?? "—",
          <Badge
            className="whitespace-nowrap"
            key={`${room.id}-public`}
            variant={room.isPublic ? "success" : "neutral"}
          >
            {room.isPublic ? "공개" : "비공개"}
          </Badge>,
          formatDate(room.updatedAt),
        ],
      }))}
    />
  );
}
