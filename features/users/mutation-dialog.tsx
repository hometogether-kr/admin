"use client";

import { XIcon } from "@phosphor-icons/react/ssr";
import { useCallback, useEffect, useRef } from "react";
import type { FormEvent, ReactNode, SyntheticEvent } from "react";

import { ActionFeedback } from "@/components/admin/action-feedback";
import { Button } from "@/components/ui/button";
import type { ButtonVariant } from "@/components/ui/button";
import type { UserId } from "@/features/users/contracts";
import { completeUserMutation } from "@/features/users/mutation-receipt";
import { IconButton } from "@/components/ui/icon-button";
import type { AdminActionResult } from "@/lib/actions/result";

type MutationDialogProps = {
  readonly action: (payload: FormData) => void;
  readonly children: ReactNode;
  readonly confirmLabel: string;
  readonly description: string;
  readonly id: string;
  readonly onReset: () => void;
  readonly onValidate: (formData: FormData) => boolean;
  readonly pending: boolean;
  readonly result: AdminActionResult;
  readonly title: string;
  readonly tone?: "default" | "destructive";
  readonly triggerLabel: string;
  readonly triggerVariant?: ButtonVariant;
  readonly userId: UserId;
};

function feedbackFor(result: AdminActionResult): {
  readonly inside: ReactNode;
  readonly outside: ReactNode;
} {
  switch (result.kind) {
    case "idle":
      return { inside: null, outside: null };
    case "success":
      return {
        inside: null,
        outside: <ActionFeedback result={result} />,
      };
    case "error":
      return {
        inside: <ActionFeedback result={result} />,
        outside: null,
      };
    default:
      return result satisfies never;
  }
}

export function MutationDialog({
  action,
  children,
  confirmLabel,
  description,
  id,
  onReset,
  onValidate,
  pending,
  result,
  title,
  tone = "default",
  triggerLabel,
  triggerVariant = "secondary",
  userId,
}: MutationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const scrollOwnerRef = useRef<HTMLElement>(null);
  const previousScrollOwnerOverflowYRef = useRef("");
  const feedback = feedbackFor(result);

  const restoreScrollOwner = useCallback((): void => {
    const scrollOwner = scrollOwnerRef.current;
    if (scrollOwner !== null) {
      scrollOwner.style.overflowY = previousScrollOwnerOverflowYRef.current;
      scrollOwnerRef.current = null;
    }
  }, []);

  useEffect(() => () => restoreScrollOwner(), [restoreScrollOwner]);

  useEffect(() => {
    switch (result.kind) {
      case "success":
        formRef.current?.reset();
        dialogRef.current?.close();
        completeUserMutation(userId, result);
        break;
      case "idle":
      case "error":
        break;
      default:
        result satisfies never;
    }
  }, [result, userId]);

  function closeDialog(): void {
    formRef.current?.reset();
    onReset();
    dialogRef.current?.close();
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>): void {
    event.preventDefault();
    closeDialog();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    if (!onValidate(new FormData(event.currentTarget))) event.preventDefault();
  }

  function openDialog(): void {
    onReset();
    const dialog = dialogRef.current;
    if (dialog === null) return;

    dialog.showModal();
    const scrollOwner = dialog.closest("main");
    if (scrollOwner instanceof HTMLElement) {
      scrollOwnerRef.current = scrollOwner;
      previousScrollOwnerOverflowYRef.current = scrollOwner.style.overflowY;
      scrollOwner.style.overflowY = "hidden";
    }
    cancelRef.current?.focus();
  }

  function handleClose(): void {
    restoreScrollOwner();
    triggerRef.current?.focus();
  }

  return (
    <div className="grid gap-3">
      {feedback.outside}
      <Button
        onClick={openDialog}
        ref={triggerRef}
        variant={triggerVariant}
      >
        {triggerLabel}
      </Button>
      <dialog
        aria-describedby={`${id}-description`}
        aria-labelledby={`${id}-title`}
        className="admin-dialog m-auto max-h-[calc(100dvb-2.5rem)] w-[min(32rem,calc(100%-2.5rem))] overflow-y-auto overscroll-contain rounded-dialog border border-line bg-surface p-0 text-ink shadow-dialog backdrop:bg-overlay"
        id={id}
        onCancel={handleCancel}
        onClose={handleClose}
        ref={dialogRef}
      >
        <form action={action} onSubmit={handleSubmit} ref={formRef}>
          <div className="grid gap-5 p-5 sm:p-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2">
              <h2
                className="text-section font-semibold text-ink-strong"
                id={`${id}-title`}
              >
                {title}
              </h2>
              <IconButton
                icon={XIcon}
                label="대화상자 닫기"
                onClick={closeDialog}
              />
              <p
                className="admin-keep-words col-span-2 text-body text-ink-subtle sm:col-span-1"
                id={`${id}-description`}
              >
                {description}
              </p>
            </div>
            {feedback.inside}
            <div className="grid gap-4">{children}</div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                onClick={closeDialog}
                ref={cancelRef}
                variant="secondary"
              >
                취소
              </Button>
              <Button
                loading={pending}
                type="submit"
                variant={tone === "destructive" ? "destructive" : "primary"}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </form>
      </dialog>
    </div>
  );
}
