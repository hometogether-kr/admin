"use client";

import { useEffect, useState } from "react";

import { ActionFeedback } from "@/components/admin/action-feedback";
import type { UserId } from "@/features/users/contracts";
import type { AdminActionResult } from "@/lib/actions/result";

const RECEIPT_STATE_KEY = "__hometogetherUserMutationReceipt";
const USER_MUTATION_MESSAGES = new Set([
  "사용자를 비활성화했습니다.",
  "제재를 적용했습니다.",
  "학생 인증을 승인했습니다.",
  "학생 인증을 반려했습니다.",
]);

type MutationReceipt = {
  readonly message: string;
  readonly userId: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMutationReceipt(value: unknown): value is MutationReceipt {
  return (
    isRecord(value) &&
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
  window.history.replaceState(
    {
      ...currentHistoryState(),
      [RECEIPT_STATE_KEY]: { message: result.message, userId },
    },
    "",
    window.location.pathname,
  );
  window.location.reload();
}

type UserMutationReceiptProps = {
  readonly userId: UserId;
};

export function UserMutationReceipt({ userId }: UserMutationReceiptProps) {
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    const state = currentHistoryState();
    const receipt = state[RECEIPT_STATE_KEY];
    const nextState = { ...state };
    delete nextState[RECEIPT_STATE_KEY];
    window.history.replaceState(nextState, "", window.location.pathname);

    if (isMutationReceipt(receipt) && receipt.userId === userId) {
      queueMicrotask(() => {
        setMessage(receipt.message);
      });
    }
  }, [userId]);

  return message === undefined ? null : (
    <ActionFeedback result={{ kind: "success", message }} />
  );
}
