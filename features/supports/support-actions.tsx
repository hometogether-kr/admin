"use client";

import { useActionState, useRef, useState } from "react";

import { ActionFeedback } from "@/components/admin/action-feedback";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  INITIAL_ADMIN_ACTION_RESULT,
  type AdminActionResult,
} from "@/lib/actions/result";
import type { SupportStatus } from "@/features/supports/schema";

type SupportMutationAction = (
  previousResult: AdminActionResult,
  formData: FormData,
) => Promise<AdminActionResult>;

type SupportActionDialogProps = {
  readonly action: SupportMutationAction;
  readonly available: boolean;
  readonly confirmLabel: string;
  readonly description: string;
  readonly dialogId: string;
  readonly resolutionLabel: string;
  readonly title: string;
  readonly tone: "default" | "destructive";
  readonly triggerLabel: string;
};

function SupportActionDialog({
  action,
  available,
  confirmLabel,
  description,
  dialogId,
  resolutionLabel,
  title,
  tone,
  triggerLabel,
}: SupportActionDialogProps) {
  const [result, formAction, pending] = useActionState(
    action,
    INITIAL_ADMIN_ACTION_RESULT,
  );
  const [resolution, setResolution] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const resolutionError =
    resolution.length > 2_000
      ? "처리 내용은 2,000자 이하로 입력해 주세요."
      : resolution.length > 0 && resolution.trim().length === 0
        ? "처리 내용을 입력해 주세요."
        : undefined;
  const adminNoteError =
    adminNote.length > 2_000
      ? "관리자 메모는 2,000자 이하로 입력해 주세요."
      : undefined;
  const valid =
    resolution.trim().length > 0 &&
    resolution.length <= 2_000 &&
    adminNote.length <= 2_000;

  return (
    <div className="grid gap-2">
      <ActionFeedback result={result} />
      {available ? (
        <ConfirmDialog
          confirmDisabled={!valid || pending}
          confirmLabel={pending ? "처리 중" : confirmLabel}
          description={description}
          id={dialogId}
          onConfirm={() => formRef.current?.requestSubmit()}
          title={title}
          tone={tone}
          triggerLabel={triggerLabel}
          triggerVariant={tone === "destructive" ? "destructive" : "primary"}
        >
          <form action={formAction} className="grid gap-4" ref={formRef}>
            <Textarea
              error={resolutionError}
              hint="공백을 제외하고 1~2,000자로 입력해 주세요."
              id={`${dialogId}-resolution`}
              label={resolutionLabel}
              maxLength={2_001}
              name="resolution"
              onChange={(event) => setResolution(event.currentTarget.value)}
              required
              value={resolution}
            />
            <Textarea
              error={adminNoteError}
              hint="내부 운영 메모입니다. 비워 둘 수 있으며 최대 2,000자입니다."
              id={`${dialogId}-admin-note`}
              label="관리자 메모"
              maxLength={2_001}
              name="adminNote"
              onChange={(event) => setAdminNote(event.currentTarget.value)}
              value={adminNote}
            />
          </form>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}

type SupportActionsProps = {
  readonly dismissAction: SupportMutationAction;
  readonly resolveAction: SupportMutationAction;
  readonly status: SupportStatus;
};

export function SupportActions({
  dismissAction,
  resolveAction,
  status,
}: SupportActionsProps) {
  const available = status === "pending" || status === "investigating";
  const completedMessage =
    status === "resolved"
      ? "이 문의는 해결 처리되었습니다."
      : status === "dismissed"
        ? "이 문의는 기각 처리되었습니다."
        : null;

  return (
    <section aria-labelledby="support-actions-title" className="grid gap-4">
      <div className="grid gap-1">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="support-actions-title"
        >
          문의 처리
        </h2>
        <p className="admin-keep-words text-body text-ink-subtle">
          해결과 기각은 서로 다른 작업입니다. 확인 대화상자에서 처리 내용을 검토한 뒤 제출합니다.
        </p>
      </div>
      {completedMessage !== null ? (
        <Alert variant="success">
          {completedMessage} 처리 기록에서 결과를 확인할 수 있습니다.
        </Alert>
      ) : null}
      <div className="flex flex-wrap items-start gap-3">
        <SupportActionDialog
          action={resolveAction}
          available={available}
          confirmLabel="해결 확정"
          description="문의 상태를 해결로 변경하고 입력한 처리 내용을 기록합니다."
          dialogId="resolve-support-dialog"
          resolutionLabel="해결 내용"
          title="문의를 해결 처리할까요?"
          tone="default"
          triggerLabel="해결 처리"
        />
        <SupportActionDialog
          action={dismissAction}
          available={available}
          confirmLabel="기각 확정"
          description="문의 상태를 기각으로 변경하고 입력한 사유를 기록합니다."
          dialogId="dismiss-support-dialog"
          resolutionLabel="기각 사유"
          title="문의를 기각 처리할까요?"
          tone="destructive"
          triggerLabel="기각 처리"
        />
      </div>
    </section>
  );
}
