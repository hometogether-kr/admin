import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { DefinitionList } from "@/components/ui/definition-list";
import { AdminApiError } from "@/lib/api/errors";
import { requireAdminSession } from "@/lib/auth/session";
import { roomIdSchema } from "@/features/rooms/action-schema";
import { LegacyRoomDetail } from "@/features/rooms/components/legacy-room-detail";
import { RegistrationRoomDetail } from "@/features/rooms/components/registration-room-detail";
import { RoomActionPanel } from "@/features/rooms/components/room-action-panel";
import { RoomStatusBadge } from "@/features/rooms/components/room-status-badge";
import { booleanLabel, formatDate } from "@/features/rooms/format";
import { readRoom } from "@/features/rooms/queries";

type RoomDetailPageProps = { readonly params: Promise<{ readonly id: string }> };

async function readRoomOrNotFound(roomId: string) {
  try {
    return await readRoom(roomId);
  } catch (cause) {
    if (cause instanceof AdminApiError && cause.status === 404) notFound();
    throw cause;
  }
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const parsedId = roomIdSchema.safeParse((await params).id);
  if (!parsedId.success) notFound();

  const room = await readRoomOrNotFound(parsedId.data);
  const session = await requireAdminSession();
  const isV2 = room.registrationContractVersion === 2;
  const roomId = isV2 ? room.roomId : room.id;
  const roomTitle = isV2 ? "v2 등록 방" : room.title ?? "제목 없는 방";

  return (
    <div className="grid gap-8">
      <PageHeader
        actions={
          <Link
            className="admin-focus admin-control inline-flex items-center justify-center rounded-control border border-line bg-surface px-4 text-body font-semibold text-ink"
            href="/rooms"
          >
            목록으로
          </Link>
        }
        description="등록 계약 원본과 현재 운영 상태를 확인하고 필요한 관리 작업을 실행합니다."
        eyebrow={<span className="admin-break-anywhere font-mono">{roomId}</span>}
        title={roomTitle}
      />
      <div className="flex flex-wrap gap-2">
        <RoomStatusBadge status={room.roomStatus} />
        <Badge variant={room.isPublic ? "success" : "neutral"}>{room.isPublic ? "공개" : "비공개"}</Badge>
        <Badge variant="info">{isV2 ? "등록 계약 v2" : "Legacy"}</Badge>
      </div>
      <DefinitionList items={isV2 ? [
        { label: "방 ID", value: room.roomId },
        { label: "상태", value: room.roomStatus },
        { label: "공개 여부", value: booleanLabel(room.isPublic) },
        { label: "제출일", value: formatDate(room.submittedAt) },
        { label: "등록 계약 버전", value: 2 },
      ] : [
        { label: "방 ID", value: room.id },
        { label: "호스트 ID", value: room.hostId },
        { label: "상태", value: room.roomStatus },
        { label: "공개 여부", value: booleanLabel(room.isPublic) },
        { label: "등록 계약 버전", value: "Legacy" },
      ]} />
      {isV2 ? <RegistrationRoomDetail room={room} /> : <LegacyRoomDetail room={room} />}
      <RoomActionPanel
        canHide={session.role !== "roomManager"}
        currentAddressHidden={isV2 ? undefined : room.isAddressDetailHidden}
        currentMemo={isV2 ? undefined : room.internalMemo}
        roomId={roomId}
      />
    </div>
  );
}
