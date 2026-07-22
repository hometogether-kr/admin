"use client";

import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  approveRoom,
  deleteRoom,
  hideRoom,
  rejectRoom,
  requestRoomRevision,
  resendRoomNotification,
  setRoomAddressVisibility,
  updateRoomMemo,
} from "@/features/rooms/actions";
import {
  ROOM_NOTIFICATION_LABELS,
  ROOM_NOTIFICATION_TEMPLATES,
} from "@/features/rooms/constants";
import { ConfirmedAction } from "@/features/rooms/components/confirmed-action";

type RoomActionPanelProps = {
  readonly canHide: boolean;
  readonly currentAddressHidden?: boolean;
  readonly currentMemo?: string | null;
  readonly roomId: string;
};

const notificationOptions = ROOM_NOTIFICATION_TEMPLATES.map((template) => ({
  label: ROOM_NOTIFICATION_LABELS[template],
  value: template,
}));

export function RoomActionPanel({
  canHide,
  currentAddressHidden,
  currentMemo,
  roomId,
}: RoomActionPanelProps) {
  const idPrefix = `room-${roomId}`;
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
      <div className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ConfirmedAction
          action={approveRoom.bind(null, roomId)}
          confirmLabel="승인"
          description="제출된 방 정보를 승인합니다."
          id={`${idPrefix}-approve`}
          title="방을 승인할까요?"
          triggerLabel="승인"
          triggerVariant="primary"
        />
        <ConfirmedAction
          action={rejectRoom.bind(null, roomId)}
          confirmLabel="반려"
          description="호스트에게 전달할 사유를 입력하세요."
          id={`${idPrefix}-reject`}
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
        <ConfirmedAction
          action={requestRoomRevision.bind(null, roomId)}
          confirmLabel="수정 요청"
          description="호스트가 보완해야 할 내용을 입력하세요."
          id={`${idPrefix}-revision`}
          title="수정을 요청할까요?"
          trimmedRequiredField={{ name: "message", message: "수정 요청 내용을 입력해 주세요." }}
          triggerLabel="수정 요청"
        >
          <Textarea
            id={`${idPrefix}-revision-message`}
            label="수정 요청 내용"
            maxLength={2_000}
            name="message"
            placeholder="확인 및 보완이 필요한 내용"
          />
        </ConfirmedAction>
        {canHide ? (
          <ConfirmedAction
            action={hideRoom.bind(null, roomId)}
            confirmLabel="숨김"
            description="사용자 화면에서 이 방을 숨깁니다."
            id={`${idPrefix}-hide`}
            title="방을 숨길까요?"
            tone="destructive"
            triggerLabel="숨김"
            triggerVariant="destructive"
          />
        ) : null}
        <ConfirmedAction
          action={resendRoomNotification.bind(null, roomId)}
          confirmLabel="재전송"
          description="선택한 운영 알림을 호스트에게 다시 보냅니다."
          id={`${idPrefix}-notification`}
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
          confirmLabel="설정 저장"
          description="상세 주소 노출 여부를 명시적으로 변경합니다."
          id={`${idPrefix}-address`}
          title="주소 공개 설정을 바꿀까요?"
          triggerLabel="주소 공개 설정"
        >
          <Select
            defaultValue={currentAddressHidden === false ? "false" : "true"}
            hint={currentAddressHidden === undefined ? "현재 값은 v2 상세 응답에 포함되지 않습니다." : undefined}
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
          confirmLabel="메모 저장"
          description="빈 값으로 저장하면 내부 메모를 제거합니다."
          id={`${idPrefix}-memo`}
          title="내부 메모를 저장할까요?"
          triggerLabel="내부 메모"
        >
          <Textarea
            defaultValue={currentMemo ?? ""}
            hint={currentMemo === undefined ? "현재 값은 v2 상세 응답에 포함되지 않습니다." : "관리자에게만 표시됩니다."}
            id={`${idPrefix}-memo-value`}
            label="내부 메모"
            maxLength={2_000}
            name="memo"
          />
        </ConfirmedAction>
        <ConfirmedAction
          action={deleteRoom.bind(null, roomId)}
          confirmLabel="방 삭제"
          description="방을 소프트 삭제합니다. 취소하면 요청은 전송되지 않습니다."
          id={`${idPrefix}-delete`}
          title="방을 삭제할까요?"
          tone="destructive"
          triggerLabel="방 삭제"
          triggerVariant="destructive"
        />
      </div>
    </section>
  );
}
