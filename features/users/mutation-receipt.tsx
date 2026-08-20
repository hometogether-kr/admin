"use client";

import { useEffect, useState } from "react";

import { ActionFeedback } from "@/components/admin/action-feedback";
import type { UserId } from "@/features/users/contracts";
import type { AdminActionResult } from "@/lib/actions/result";

const RECEIPT_STATE_KEY = "__hometogetherUserMutationReceipt";
const USER_DELETION_MESSAGE = "사용자를 삭제했습니다.";
const USER_MUTATION_MESSAGES = new Set([
  "사용자 정보를 수정했습니다.",
  "제재를 적용했습니다.",
  "학생 인증을 승인했습니다.",
  "학생 인증을 반려했습니다.",
  USER_DELETION_MESSAGE,
]);

type MutationReceipt = {
  readonly destination: string;
  readonly message: string;
  readonly userId: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMutationReceipt(value: unknown): value is MutationReceipt {
  return (
    isRecord(value) &&
    typeof value.destination === "string" &&
    typeof value.userId === "string" &&
    typeof value.message === "string" &&
    USER_MUTATION_MESSAGES.has(value.message)
  );
}

function currentHistoryState(): Record<string, unknown> {
  const state: unknown = window.history.state;
  return isRecord(state) ? state : {};
}

export function completeUserMutation(
  userId: UserId,
  result: AdminActionResult,
): void {
  if (result.kind !== "success" || !USER_MUTATION_MESSAGES.has(result.message)) {
    return;
  }
  const destination = result.message === USER_DELETION_MESSAGE
    ? "/users"
    : window.location.pathname;
  window.history.replaceState(
    {
      ...currentHistoryState(),
      [RECEIPT_STATE_KEY]: { destination, message: result.message, userId },
    },
    "",
    destination,
  );
  window.location.reload();
}

type UserMutationReceiptProps =
  | { readonly surface: "detail"; readonly userId: UserId }
  | { readonly surface: "list" };

export function UserMutationReceipt(props: UserMutationReceiptProps) {
  const [message, setMessage] = useState<string>();
  const expectedUserId = props.surface === "detail" ? props.userId : undefined;

  useEffect(() => {
    const state = currentHistoryState();
    const receipt = state[RECEIPT_STATE_KEY];
    const nextState = { ...state };
    delete nextState[RECEIPT_STATE_KEY];
    window.history.replaceState(nextState, "", window.location.pathname);

    if (!isMutationReceipt(receipt) || receipt.destination !== window.location.pathname) {
      return;
    }
    const matchesSurface = props.surface === "detail"
      ? receipt.userId === expectedUserId && receipt.message !== USER_DELETION_MESSAGE
      : receipt.message === USER_DELETION_MESSAGE;
    if (matchesSurface) {
      queueMicrotask(() => {
        setMessage(receipt.message);
      });
    }
  }, [expectedUserId, props.surface]);

  return message === undefined ? null : (
    <ActionFeedback result={{ kind: "success", message }} />
  );
}
