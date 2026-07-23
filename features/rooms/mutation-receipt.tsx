"use client";

import { useEffect, useState } from "react";

import { ActionFeedback } from "@/components/admin/action-feedback";
import { roomIdSchema } from "@/features/rooms/action-schema";
import type { AdminActionResult } from "@/lib/actions/result";

const RECEIPT_STATE_KEY = "__hometogetherRoomMutationReceipt";
const ROOM_DELETION_MESSAGE = "방을 삭제했습니다.";
const ROOM_MUTATION_MESSAGES = new Set([
  "방을 승인했습니다.",
  "방을 반려했습니다.",
  "수정을 요청했습니다.",
  "방을 숨겼습니다.",
  "알림을 다시 보냈습니다.",
  "상세 주소 공개 설정을 변경했습니다.",
  "내부 메모를 저장했습니다.",
  "미디어를 삭제했습니다.",
  ROOM_DELETION_MESSAGE,
]);

type MutationReceipt = {
  readonly destination: string;
  readonly message: string;
  readonly roomId: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMutationReceipt(value: unknown): value is MutationReceipt {
  return (
    isRecord(value)
    && typeof value.destination === "string"
    && typeof value.message === "string"
    && typeof value.roomId === "string"
    && roomIdSchema.safeParse(value.roomId).success
    && ROOM_MUTATION_MESSAGES.has(value.message)
  );
}

function currentHistoryState(): Record<string, unknown> {
  const state: unknown = window.history.state;
  return isRecord(state) ? state : {};
}

function completeRoomMutation(roomId: string, result: AdminActionResult): void {
  if (
    result.kind !== "success"
    || !roomIdSchema.safeParse(roomId).success
    || !ROOM_MUTATION_MESSAGES.has(result.message)
  ) {
    return;
  }
  const destination = result.message === ROOM_DELETION_MESSAGE
    ? "/rooms"
    : window.location.pathname;
  window.history.replaceState(
    {
      ...currentHistoryState(),
      [RECEIPT_STATE_KEY]: { destination, message: result.message, roomId },
    },
    "",
    destination,
  );
  window.location.reload();
}

type RoomMutationCompletionProps = {
  readonly result: AdminActionResult;
  readonly roomId: string;
};

export function RoomMutationCompletion({
  result,
  roomId,
}: RoomMutationCompletionProps) {
  useEffect(() => {
    completeRoomMutation(roomId, result);
  }, [result, roomId]);

  return null;
}

type RoomMutationReceiptProps =
  | { readonly roomId: string; readonly surface: "detail" }
  | { readonly surface: "list" };

export function RoomMutationReceipt(props: RoomMutationReceiptProps) {
  const [message, setMessage] = useState<string>();
  const expectedRoomId = props.surface === "detail" ? props.roomId : undefined;

  useEffect(() => {
    const state = currentHistoryState();
    const receipt = state[RECEIPT_STATE_KEY];
    const nextState = { ...state };
    delete nextState[RECEIPT_STATE_KEY];
    window.history.replaceState(nextState, "");

    if (!isMutationReceipt(receipt) || receipt.destination !== window.location.pathname) {
      return;
    }
    const matchesSurface = props.surface === "detail"
      ? receipt.roomId === expectedRoomId && receipt.message !== ROOM_DELETION_MESSAGE
      : receipt.message === ROOM_DELETION_MESSAGE;
    if (matchesSurface) {
      queueMicrotask(() => {
        setMessage(receipt.message);
      });
    }
  }, [expectedRoomId, props.surface]);

  return message === undefined ? null : (
    <ActionFeedback result={{ kind: "success", message }} />
  );
}
