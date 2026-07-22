"use client";

import { deleteRoomMedia } from "@/features/rooms/actions";
import { ConfirmedAction } from "@/features/rooms/components/confirmed-action";

type MediaDeleteActionProps = {
  readonly filename: string;
  readonly mediaId: string;
  readonly roomId: string;
};

export function MediaDeleteAction({ filename, mediaId, roomId }: MediaDeleteActionProps) {
  return (
    <ConfirmedAction
      action={deleteRoomMedia.bind(null, roomId, mediaId)}
      confirmLabel="미디어 삭제"
      description={`“${filename}” 파일을 방에서 삭제합니다. 취소하면 요청은 전송되지 않습니다.`}
      id={`room-${roomId}-media-${mediaId}-delete`}
      title="미디어를 삭제할까요?"
      tone="destructive"
      triggerLabel="삭제"
      triggerVariant="destructive"
    />
  );
}
