"use client";

import { useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";

import { ActionFeedback } from "@/components/admin/action-feedback";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  REPORT_RESOLUTION_STATUSES,
  REPORT_STATUS_LABELS,
  parseReportResolutionStatus,
  type ReportResolutionStatus,
  type ReportStatus,
} from "@/features/reports/constants";
import { resolveReportAction } from "@/features/reports/actions";
import {
  INITIAL_ADMIN_ACTION_RESULT,
  type AdminActionResult,
} from "@/lib/actions/result";

type ResolutionFormProps = {
  readonly currentStatus: ReportStatus;
  readonly reportId: string;
};

export function ResolutionForm({
  currentStatus,
  reportId,
}: ResolutionFormProps) {
  const initialStatus = parseReportResolutionStatus(currentStatus);
  const [status, setStatus] = useState<ReportResolutionStatus>(
    initialStatus ?? "investigating",
  );
  const [memo, setMemo] = useState("");
  const [result, setResult] = useState<AdminActionResult>(
    INITIAL_ADMIN_ACTION_RESULT,
  );
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const isFinalized =
    currentStatus === "resolved" || currentStatus === "dismissed";
  const memoError =
    memo.length > 1_000 ? "처리 메모는 1,000자 이하로 입력해 주세요." : undefined;

  function submitConfirmedResolution(): void {
    formRef.current?.requestSubmit();
  }

  function submitResolution(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setResult(INITIAL_ADMIN_ACTION_RESULT);
    startTransition(async () => {
      setResult(
        await resolveReportAction(INITIAL_ADMIN_ACTION_RESULT, formData),
      );
    });
  }

  return (
    <section aria-labelledby="report-resolution-title" className="grid gap-4">
      <div className="grid gap-1">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="report-resolution-title"
        >
          신고 처리
        </h2>
        <p className="admin-keep-words text-body text-ink-subtle">
          현재 상태는 {REPORT_STATUS_LABELS[currentStatus]}입니다. 저장 전 처리
          의도를 다시 확인합니다.
        </p>
      </div>

      <form
        aria-label="신고 처리 상태 변경"
        className="grid gap-4 rounded-panel border border-line bg-surface p-4 sm:p-5"
        onSubmit={submitResolution}
        ref={formRef}
      >
        <input name="reportId" type="hidden" value={reportId} />
        <div className="grid items-start gap-4 md:grid-cols-2">
          <Select
            disabled={isFinalized || pending}
            id="report-resolution-status"
            label="처리 상태"
            name="status"
            onChange={(event) => {
              const nextStatus = parseReportResolutionStatus(
                event.currentTarget.value,
              );
              if (nextStatus !== null) setStatus(nextStatus);
            }}
            options={REPORT_RESOLUTION_STATUSES.map((value) => ({
              label: REPORT_STATUS_LABELS[value],
              value,
            }))}
            required
            value={status}
          />
          <Textarea
            disabled={isFinalized || pending}
            error={memoError}
            hint={`${memo.length.toLocaleString("ko-KR")} / 1,000자`}
            id="report-resolution-memo"
            label="처리 메모"
            maxLength={1_000}
            name="memo"
            onChange={(event) => setMemo(event.currentTarget.value)}
            value={memo}
          />
        </div>

        <ActionFeedback result={result} />

        {isFinalized ? (
          <Alert variant="info">
            해결되거나 기각된 신고는 다시 처리할 수 없습니다.
          </Alert>
        ) : (
          <div className="flex justify-end">
            <ConfirmDialog
              confirmDisabled={pending || memoError !== undefined}
              confirmLabel={pending ? "저장 중" : "처리 상태 저장"}
              description={`신고를 ${REPORT_STATUS_LABELS[status]} 상태로 변경합니다. 이 작업은 관리자 처리 이력에 기록됩니다.`}
              id={`resolve-report-${reportId}`}
              onConfirm={submitConfirmedResolution}
              title="신고 처리 상태를 저장할까요?"
              triggerLabel="처리 상태 변경"
              triggerVariant="primary"
            >
              <p className="admin-keep-words text-body text-ink-subtle">
                선택 상태: {REPORT_STATUS_LABELS[status]}
                {memo.trim().length > 0
                  ? ` · 메모 ${memo.trim().length.toLocaleString("ko-KR")}자`
                  : " · 메모 없음"}
              </p>
            </ConfirmDialog>
          </div>
        )}
      </form>
    </section>
  );
}
