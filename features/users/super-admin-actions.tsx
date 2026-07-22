"use client";

import { startTransition, useActionState, useEffect } from "react";

import { ActionFeedback } from "@/components/admin/action-feedback";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { disableUserAction } from "@/features/users/actions";
import type { UserId } from "@/features/users/contracts";
import { completeUserMutation } from "@/features/users/mutation-receipt";
import { SanctionDialog } from "@/features/users/sanction-dialog";
import { INITIAL_ADMIN_ACTION_RESULT } from "@/lib/actions/result";

type SuperAdminActionsProps = {
  readonly userId: UserId;
};

export function SuperAdminActions({ userId }: SuperAdminActionsProps) {
  const [disableResult, disable, disablePending] = useActionState(
    disableUserAction,
    INITIAL_ADMIN_ACTION_RESULT,
  );

  useEffect(() => {
    completeUserMutation(userId, disableResult);
  }, [disableResult, userId]);

  function confirmDisablement(): void {
    const formData = new FormData();
    formData.set("userId", userId);
    startTransition(() => disable(formData));
  }

  return (
    <section
      aria-labelledby="super-admin-actions-title"
      className="grid gap-5 border-t border-line-subtle pt-6"
    >
      <div className="grid gap-1">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="super-admin-actions-title"
        >
          최고 관리자 작업
        </h2>
        <p className="admin-keep-words text-body text-ink-subtle">
          비활성화와 제재는 최고 관리자만 수행할 수 있습니다.
        </p>
      </div>
      <ActionFeedback result={disableResult} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid content-start gap-3 rounded-panel border border-line-subtle bg-surface p-4">
          <div className="grid gap-1">
            <h3 className="text-subsection font-semibold text-ink-strong">
              사용자 비활성화
            </h3>
            <p className="admin-keep-words text-body text-ink-subtle">
              비활성 계정은 사용자 목록에서 제외합니다.
            </p>
          </div>
          <ConfirmDialog
            confirmDisabled={disablePending}
            confirmLabel="비활성화 확정"
            description="사용자 계정을 비활성화합니다. 대상을 확인해 주세요."
            id={`disable-user-${userId}`}
            onConfirm={confirmDisablement}
            title="사용자 비활성화"
            tone="destructive"
            triggerLabel="사용자 비활성화"
            triggerVariant="destructive"
          />
        </div>
        <div className="grid content-start gap-3 rounded-panel border border-line-subtle bg-surface p-4">
          <div className="grid gap-1">
            <h3 className="text-subsection font-semibold text-ink-strong">
              제재 적용
            </h3>
            <p className="admin-keep-words text-body text-ink-subtle">
              제재 정보를 확인하고 적용합니다.
            </p>
          </div>
          <SanctionDialog userId={userId} />
        </div>
      </div>
    </section>
  );
}
