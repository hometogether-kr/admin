import { Badge } from "@/components/ui/badge";
import {
  ROOM_STATUS_BADGE,
  ROOM_STATUS_LABELS,
  type RoomStatus,
} from "@/features/rooms/constants";

type RoomStatusBadgeProps = { readonly status: RoomStatus };

export function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  return (
    <Badge className="whitespace-nowrap" variant={ROOM_STATUS_BADGE[status]}>
      {ROOM_STATUS_LABELS[status]}
    </Badge>
  );
}
