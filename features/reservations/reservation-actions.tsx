"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { FormEvent, SyntheticEvent } from "react";
import { useRouter } from "next/navigation";

import { ActionFeedback } from "@/components/admin/action-feedback";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  INITIAL_ADMIN_ACTION_RESULT,
  type AdminActionResult,
} from "@/lib/actions/result";

import {
  isTerminalReservationStatus,
  NOTIFICATION_TEMPLATE_LABELS,
  NOTIFICATION_TEMPLATES,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUSES,
  type ReservationStatus,
} from "@/features/reservations/constants";
import {
  resendReservationNotification,
  updateReservationStatus,
} from "@/features/reservations/actions";

type ReservationActionProps = {
  readonly reservationId: string;
  readonly currentStatus: ReservationStatus;
  readonly onStatusUpdated: (status: ReservationStatus) => void;
};

const statusOptions = RESERVATION_STATUSES.map((value) => ({
  label: RESERVATION_STATUS_LABELS[value],
  value,
}));

const notificationOptions = NOTIFICATION_TEMPLATES.map((value) => ({
  label: NOTIFICATION_TEMPLATE_LABELS[value],
  value,
}));

function useBoundActionResult<Action extends (
  reservationId: string,
  previousState: AdminActionResult,
  formData: FormData,
) => Promise<AdminActionResult>>(
  action: Action,
  reservationId: string,
): readonly [AdminActionResult, (formData: FormData) => void, boolean] {
  const boundAction = action.bind(null, reservationId);
  return useActionState(boundAction, INITIAL_ADMIN_ACTION_RESULT);
}

export function ReservationStatusForm({
  currentStatus,
  onStatusUpdated,
  reservationId,
}: ReservationActionProps) {
  const [result, formAction, pending] = useBoundActionResult(
    updateReservationStatus,
    reservationId,
  );
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const confirmationInputRef = useRef<HTMLInputElement>(null);
  const [pendingStatus, setPendingStatus] = useState<ReservationStatus | null>(
    null,
  );
  const confirmedStatusRef = useRef<ReservationStatus | null>(null);
  const submittedStatusRef = useRef<ReservationStatus | null>(null);

  useEffect(() => {
    if (pending) return;
    confirmedStatusRef.current = null;
    if (confirmationInputRef.current !== null) {
      confirmationInputRef.current.value = "false";
    }
  }, [pending]);

  useEffect(() => {
    if (result.kind !== "success") return;
    const status = submittedStatusRef.current;
    if (status !== null) onStatusUpdated(status);
    router.refresh();
  }, [onStatusUpdated, result, router]);

  function openConfirmation(status: ReservationStatus): void {
    setPendingStatus(status);
    if (dialogRef.current?.open !== true) dialogRef.current?.showModal();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    const statusControl = event.currentTarget.elements.namedItem("status");
    if (!(statusControl instanceof HTMLSelectElement)) return;
    const status = RESERVATION_STATUSES.find(
      (candidate) => candidate === statusControl.value,
    );
    if (status === undefined) return;
    submittedStatusRef.current = status;
    if (
      isTerminalReservationStatus(status) &&
      confirmedStatusRef.current !== status
    ) {
      event.preventDefault();
      openConfirmation(status);
    }
  }

  function handleStatusChange(): void {
    confirmedStatusRef.current = null;
    submittedStatusRef.current = null;
    if (confirmationInputRef.current !== null) {
      confirmationInputRef.current.value = "false";
    }
  }

  function confirmTerminalStatus(): void {
    const status = pendingStatus;
    const form = formRef.current;
    if (status === null || form === null) return;
    confirmedStatusRef.current = status;
    submittedStatusRef.current = status;
    if (confirmationInputRef.current !== null) {
      confirmationInputRef.current.value = "true";
    }
    dialogRef.current?.close();
    form.requestSubmit();
  }

  function closeConfirmation(): void {
    setPendingStatus(null);
    dialogRef.current?.close();
  }

  function handleDialogCancel(event: SyntheticEvent<HTMLDialogElement>): void {
    event.preventDefault();
    closeConfirmation();
  }

  function returnFocus(): void {
    submitRef.current?.focus();
  }

  return (
    <>
      <form
        action={formAction}
        className="grid gap-4"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <Select
          defaultValue={currentStatus}
          id={`${reservationId}-status`}
          key={currentStatus}
          label="예약 상태"
          name="status"
          onChange={handleStatusChange}
          options={statusOptions}
          required
        />
        <Textarea
          id={`${reservationId}-status-note`}
          label="상태 변경 메모"
          name="note"
          placeholder="선택 사항"
          rows={4}
        />
        <input
          defaultValue="false"
          name="confirmTerminal"
          ref={confirmationInputRef}
          type="hidden"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ActionFeedback result={result} />
          <Button loading={pending} ref={submitRef} type="submit" variant="primary">
            상태 저장
          </Button>
        </div>
      </form>
      <dialog
        aria-describedby={`${reservationId}-status-confirm-description`}
        aria-labelledby={`${reservationId}-status-confirm-title`}
        className="admin-dialog m-auto w-[min(28rem,calc(100%-2.5rem))] rounded-dialog border border-line bg-surface p-0 text-ink shadow-dialog backdrop:bg-overlay"
        onCancel={handleDialogCancel}
        onClose={returnFocus}
        ref={dialogRef}
      >
        <div className="grid gap-5 p-5 sm:p-6">
          <div className="grid gap-2">
            <h3
              className="text-section font-semibold text-ink-strong"
              id={`${reservationId}-status-confirm-title`}
            >
              종료 상태로 변경할까요?
            </h3>
            <p
              className="admin-keep-words text-body text-ink-subtle"
              id={`${reservationId}-status-confirm-description`}
            >
              {pendingStatus === null
                ? "변경 후에는 예약 상태를 다시 확인해야 합니다."
                : `${RESERVATION_STATUS_LABELS[pendingStatus]} 상태로 변경합니다. 계속하시겠습니까?`}
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button autoFocus onClick={closeConfirmation} variant="secondary">
              취소
            </Button>
            <Button onClick={confirmTerminalStatus} variant="destructive">
              변경 확인
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export function NotificationResendForm({
  reservationId,
}: Pick<ReservationActionProps, "reservationId">) {
  const [result, formAction, pending] = useBoundActionResult(
    resendReservationNotification,
    reservationId,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <Select
        defaultValue={NOTIFICATION_TEMPLATES[0]}
        id={`${reservationId}-notification-template`}
        label="알림 템플릿"
        name="templateCode"
        options={notificationOptions}
        required
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ActionFeedback result={result} />
        <Button loading={pending} type="submit" variant="secondary">
          알림 재발송
        </Button>
      </div>
    </form>
  );
}
