"use client";

import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  approveRoom,
  republishRoom,
  deleteRoom,
  hideRoom,
  rejectRoom,
  resendRoomNotification,
  setRoomAddressVisibility,
  updateRoomMemo,
} from "@/features/rooms/actions";
import {
  ROOM_NOTIFICATION_LABELS,
  ROOM_NOTIFICATION_TEMPLATES,
} from "@/features/rooms/constants";
import { ConfirmedAction } from "@/features/rooms/components/confirmed-action";
import { useRoomMutationState } from "@/features/rooms/components/room-mutation-provider";

type RoomActionPanelProps = {
  readonly canHide: boolean;
  readonly canApprove: boolean;
  readonly publishLabel: string;
  readonly currentAddressHidden: boolean;
  readonly currentMemo: string | null;
  readonly roomId: string;
};

const notificationOptions = ROOM_NOTIFICATION_TEMPLATES.map((template) => ({
  label: ROOM_NOTIFICATION_LABELS[template],
  value: template,
}));

export function RoomActionPanel({
  canHide,
  canApprove,
  publishLabel,
  currentAddressHidden,
  currentMemo,
  roomId,
}: RoomActionPanelProps) {
  const idPrefix = `room-${roomId}`;
  const { addressDirty } = useRoomMutationState();
  return (
    <section aria-labelledby="room-actions-heading" className="grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-section font-semibold text-ink-strong" id="room-actions-heading">
          관리 작업
        </h2>
        <p className="text-body text-ink-subtle">
          모든 변경은 확인 후 실행되며 목록과 상세 화면에{" "}
          <span className="whitespace-nowrap">즉시 반영됩니다.</span>
        </p>
      </div>
      {addressDirty ? <p className="text-body text-ink-subtle">저장되지 않은 주소 변경이 있습니다. 주소를 먼저 저장하고 확인한 뒤 게시해 주세요.</p> : null}
      <div className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ConfirmedAction
          action={(publishLabel === "재게시" ? republishRoom : approveRoom).bind(null, roomId)}
          disabled={!canApprove || addressDirty}
          confirmLabel={publishLabel}
          description={publishLabel === "재게시" ? "주소 확인을 마친 숨김 매물을 사용자 화면에 다시 게시합니다." : "주소 확인을 마친 매물을 승인하고 사용자 화면에 게시합니다."}
          id={`${idPrefix}-approve`}
          roomId={roomId}
          title={`방을 ${publishLabel}할까요?`}
          triggerLabel={publishLabel}
          triggerVariant="primary"
        />
        <ConfirmedAction
          action={rejectRoom.bind(null, roomId)}
          confirmLabel="반려"
          description="호스트에게 전달할 사유를 입력하세요."
          id={`${idPrefix}-reject`}
          roomId={roomId}
          title="방을 반려할까요?"
          tone="destructive"
          trimmedRequiredField={{ name: "reason", message: "반려 사유를 입력해 주세요." }}
          triggerLabel="반려"
          triggerVariant="destructive"
        >
          <Textarea
            id={`${idPrefix}-reject-reason`}
            label="반려 사유"
            maxLength={1_000}
            name="reason"
            placeholder="구체적인 반려 사유"
          />
        </ConfirmedAction>
        <div className="grid gap-2">
          <Button disabled type="button">수정 요청 (준비 중)</Button>
          <p className="text-compact text-ink-subtle">호스트의 제출 후 수정·재제출 기능은 추후 제공됩니다.</p>
        </div>
        {canHide ? (
          <ConfirmedAction
            action={hideRoom.bind(null, roomId)}
            confirmLabel="숨김"
            description="사용자 화면에서 이 방을 숨깁니다."
            id={`${idPrefix}-hide`}
            roomId={roomId}
            title="방을 숨길까요?"
            tone="destructive"
            triggerLabel="숨김"
            triggerVariant="destructive"
          />
        ) : null}
        <ConfirmedAction
          action={resendRoomNotification.bind(null, roomId)}
          confirmLabel="재전송"
          description="선택한 운영 알림의 재전송을 요청합니다. 실제 전달 결과는 알림 로그에서 확인해 주세요."
          id={`${idPrefix}-notification`}
          roomId={roomId}
          title="알림을 다시 보낼까요?"
          triggerLabel="알림 재전송"
        >
          <Select
            defaultValue="roomApproved"
            id={`${idPrefix}-template`}
            label="알림 종류"
            name="templateCode"
            options={notificationOptions}
          />
        </ConfirmedAction>
        <ConfirmedAction
          action={setRoomAddressVisibility.bind(null, roomId)}
          key={`address-visibility-${currentAddressHidden}`}
          confirmLabel="설정 저장"
          description="상세 주소 노출 여부를 명시적으로 변경합니다."
          id={`${idPrefix}-address`}
          roomId={roomId}
          title="주소 공개 설정을 바꿀까요?"
          triggerLabel="주소 공개 설정"
        >
          <Select
            defaultValue={String(currentAddressHidden)}
            hint="관리자는 숨김 설정과 관계없이 상세주소를 볼 수 있습니다."
            id={`${idPrefix}-address-hidden`}
            label="상세 주소"
            name="hidden"
            options={[
              { label: "숨김", value: "true" },
              { label: "공개", value: "false" },
            ]}
          />
        </ConfirmedAction>
        <ConfirmedAction
          action={updateRoomMemo.bind(null, roomId)}
          key={`internal-memo-${currentMemo}`}
          confirmLabel="메모 저장"
          description="빈 값으로 저장하면 내부 메모를 제거합니다."
          id={`${idPrefix}-memo`}
          roomId={roomId}
          title="내부 메모를 저장할까요?"
          triggerLabel="내부 메모"
        >
          <Textarea
            defaultValue={currentMemo ?? ""}
            hint="관리자에게만 표시됩니다."
            id={`${idPrefix}-memo-value`}
            label="내부 메모"
            maxLength={2_000}
            name="memo"
          />
        </ConfirmedAction>
        <ConfirmedAction
          action={deleteRoom.bind(null, roomId)}
          confirmLabel="방 삭제"
          description="방을 삭제하고 목록에서 제외합니다. 활성 예약이 있으면 삭제할 수 없습니다. 취소하면 삭제하지 않습니다."
          id={`${idPrefix}-delete`}
          roomId={roomId}
          title="방을 삭제할까요?"
          tone="destructive"
          triggerLabel="방 삭제"
          triggerVariant="destructive"
        />
      </div>
    </section>
  );
}
