"use client";

import { startTransition, useActionState, useEffect } from "react";

import { ActionFeedback } from "@/components/admin/action-feedback";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { approveStudentAction } from "@/features/users/actions";
import type { UserId } from "@/features/users/contracts";
import { completeUserMutation } from "@/features/users/mutation-receipt";
import { RejectionDialog } from "@/features/users/rejection-dialog";
import { INITIAL_ADMIN_ACTION_RESULT } from "@/lib/actions/result";

type VerificationActionsProps = {
  readonly userId: UserId;
};

export function VerificationActions({ userId }: VerificationActionsProps) {
  const [approvalResult, approve, approvalPending] = useActionState(
    approveStudentAction,
    INITIAL_ADMIN_ACTION_RESULT,
  );

  useEffect(() => {
    completeUserMutation(userId, approvalResult);
  }, [approvalResult, userId]);

  function confirmApproval(): void {
    const formData = new FormData();
    formData.set("userId", userId);
    startTransition(() => approve(formData));
  }

  return (
    <section
      aria-labelledby="student-verification-title"
      className="grid gap-4 border-t border-line-subtle pt-6"
    >
      <div className="grid gap-1">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="student-verification-title"
        >
          학생 인증 처리
        </h2>
        <p className="admin-keep-words text-body text-ink-subtle">
          학생 인증의 승인·반려를 처리합니다.
        </p>
      </div>
      <ActionFeedback result={approvalResult} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <ConfirmDialog
          confirmDisabled={approvalPending}
          confirmLabel="승인 확정"
          description="이 학생 사용자의 인증을 승인합니다. 현재 상태는 별도로 표시되지 않습니다."
          id={`approve-student-${userId}`}
          onConfirm={confirmApproval}
          title="학생 인증 승인"
          triggerLabel="인증 승인"
          triggerVariant="primary"
        />
        <RejectionDialog userId={userId} />
      </div>
    </section>
  );
}
