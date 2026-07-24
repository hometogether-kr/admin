"use client";

import { XIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useActionState,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode, SyntheticEvent } from "react";

import { ActionFeedback } from "@/components/admin/action-feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INITIAL_ADMIN_ACTION_RESULT } from "@/lib/actions/result";

import {
  type NotificationResendActionResult,
  resendNotificationLogAction,
} from "./actions";
import {
  formatNotificationNumber,
  SEND_STATUS_CLASSES,
  SEND_STATUS_LABELS,
} from "./format";

type NotificationDelivery = {
  readonly attempts: number;
  readonly sendStatus: "pending" | "sent" | "failed";
};

type NotificationResendContextValue = {
  readonly delivery: NotificationDelivery | null;
  readonly setDelivery: (delivery: NotificationDelivery) => void;
};

const NotificationResendContext =
  createContext<NotificationResendContextValue | null>(null);

function useNotificationResend(): NotificationResendContextValue {
  const value = useContext(NotificationResendContext);
  if (value === null) {
    throw new Error("Notification resend components require their provider.");
  }
  return value;
}

export function NotificationResendProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [delivery, setDelivery] = useState<NotificationDelivery | null>(null);
  const value = useMemo(() => ({ delivery, setDelivery }), [delivery]);

  return (
    <NotificationResendContext value={value}>
      {children}
    </NotificationResendContext>
  );
}

export function NotificationDeliveryStatus({
  initialStatus,
}: {
  readonly initialStatus: NotificationDelivery["sendStatus"];
}) {
  const { delivery } = useNotificationResend();
  const sendStatus = delivery?.sendStatus ?? initialStatus;

  return (
    <Badge className="whitespace-nowrap" variant={SEND_STATUS_CLASSES[sendStatus]}>
      {SEND_STATUS_LABELS[sendStatus]}
    </Badge>
  );
}

export function NotificationDeliveryAttempts({
  initialAttempts,
}: {
  readonly initialAttempts: number;
}) {
  const { delivery } = useNotificationResend();
  return <span>{formatNotificationNumber(delivery?.attempts ?? initialAttempts)}</span>;
}

type ResendNotificationDialogProps = {
  readonly logId: string;
};

export function ResendNotificationDialog({
  logId,
}: ResendNotificationDialogProps) {
  const router = useRouter();
  const { setDelivery } = useNotificationResend();
  const [result, formAction, pending] = useActionState(
    resendNotificationLogAction,
    INITIAL_ADMIN_ACTION_RESULT satisfies NotificationResendActionResult,
  );
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (result.kind !== "success") return;
    if (dialogRef.current?.open) dialogRef.current.close();
    if (result.delivery !== null) setDelivery(result.delivery);
    router.refresh();
  }, [result, router, setDelivery]);

  function closeDialog(): void {
    dialogRef.current?.close();
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>): void {
    event.preventDefault();
    closeDialog();
  }

  function openDialog(): void {
    dialogRef.current?.showModal();
    cancelRef.current?.focus();
  }

  return (
    <div className="grid justify-items-end gap-2">
      <Button onClick={openDialog} ref={triggerRef} variant="primary">
        재전송
      </Button>
      <ActionFeedback result={result} />
      <dialog
        aria-describedby="notification-resend-description"
        aria-labelledby="notification-resend-title"
        className="admin-dialog m-auto w-[min(28rem,calc(100%-2.5rem))] rounded-dialog border border-line bg-surface p-0 text-ink shadow-dialog backdrop:bg-overlay"
        onCancel={handleCancel}
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <form action={formAction} className="grid gap-5 p-5 sm:p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2">
            <h2
              className="text-section font-semibold text-ink-strong"
              id="notification-resend-title"
            >
              알림을 다시 전송할까요?
            </h2>
            <button
              aria-label="대화상자 닫기"
              className="admin-focus admin-interactive flex size-touch items-center justify-center rounded-control text-ink hover:bg-surface-muted"
              onClick={closeDialog}
              type="button"
            >
              <XIcon aria-hidden="true" focusable="false" size={20} weight="bold" />
            </button>
            <p
              className="admin-keep-words col-span-2 text-body text-ink-subtle sm:col-span-1"
              id="notification-resend-description"
            >
              알림을 다시 전송합니다. 전송 시도가 기록됩니다.
            </p>
          </div>
          <input name="logId" type="hidden" value={logId} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              autoFocus
              onClick={closeDialog}
              ref={cancelRef}
              type="button"
              variant="secondary"
            >
              취소
            </Button>
            <Button loading={pending} type="submit" variant="primary">
              재전송 확인
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
