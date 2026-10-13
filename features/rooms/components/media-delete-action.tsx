"use client";

import { deleteRoomMedia } from "@/features/rooms/actions";
import { ConfirmedAction } from "@/features/rooms/components/confirmed-action";

type MediaDeleteActionProps = {
  readonly filename: string;
  readonly mediaId: string;
  readonly roomId: string;
  readonly isLastPhoto: boolean;
  readonly isRepresentative: boolean;
};

export function MediaDeleteAction({ filename, mediaId, roomId, isLastPhoto, isRepresentative }: MediaDeleteActionProps) {
  return (
    <div className="grid gap-2">
      <ConfirmedAction
        action={deleteRoomMedia.bind(null, roomId, mediaId)}
        disabled={isLastPhoto}
        confirmLabel="미디어 삭제"
        description={`“${filename}” 파일을 방에서 삭제합니다. ${isRepresentative ? "남은 첫 사진이 대표 사진으로 지정됩니다." : "기존 대표 사진은 유지됩니다."} 취소하면 요청은 전송되지 않습니다.`}
        id={`room-${roomId}-media-${mediaId}-delete`}
        roomId={roomId}
        title="미디어를 삭제할까요?"
        tone="destructive"
        triggerLabel="삭제"
        triggerVariant="destructive"
      />
      {isLastPhoto ? <p className="text-compact text-ink-subtle">매물 사진은 최소 한 장을 유지해야 하므로 마지막 사진은 삭제할 수 없습니다.</p> : null}
    </div>
  );
}
