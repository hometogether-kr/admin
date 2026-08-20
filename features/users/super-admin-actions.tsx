"use client";

import { startTransition, useActionState, useEffect } from "react";

import { ActionFeedback } from "@/components/admin/action-feedback";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteUserAction } from "@/features/users/actions";
import type { UserId } from "@/features/users/contracts";
import { completeUserMutation } from "@/features/users/mutation-receipt";
import { SanctionDialog } from "@/features/users/sanction-dialog";
import { INITIAL_ADMIN_ACTION_RESULT } from "@/lib/actions/result";

type SuperAdminActionsProps = {
  readonly userId: UserId;
  readonly canDelete: boolean;
};

export function SuperAdminActions({ canDelete, userId }: SuperAdminActionsProps) {
  const [deleteResult, remove, deletePending] = useActionState(
    deleteUserAction,
    INITIAL_ADMIN_ACTION_RESULT,
  );

  useEffect(() => {
    completeUserMutation(userId, deleteResult);
  }, [deleteResult, userId]);

  function confirmDeletion(): void {
    const formData = new FormData();
    formData.set("userId", userId);
    startTransition(() => remove(formData));
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
          삭제와 제재는 최고 관리자만 수행할 수 있습니다.
        </p>
      </div>
      <ActionFeedback result={deleteResult} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid content-start gap-3 rounded-panel border border-line-subtle bg-surface p-4">
          <div className="grid gap-1">
            <h3 className="text-subsection font-semibold text-ink-strong">
              사용자 삭제
            </h3>
            <p className="admin-keep-words text-body text-ink-subtle">
              계정을 소프트 삭제하며 감사 로그를 남깁니다.
            </p>
          </div>
          <ConfirmDialog
            confirmDisabled={deletePending || !canDelete}
            confirmLabel="삭제 확정"
            description={canDelete ? "이 사용자 계정을 소프트 삭제합니다." : "현재 로그인한 관리자 계정은 삭제할 수 없습니다."}
            id={`delete-user-${userId}`}
            onConfirm={confirmDeletion}
            title="사용자 삭제"
            tone="destructive"
            triggerLabel={canDelete ? "사용자 삭제" : "내 계정은 삭제할 수 없음"}
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
