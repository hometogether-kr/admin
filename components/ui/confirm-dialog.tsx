"use client";

import { XIcon } from "@phosphor-icons/react/ssr";
import { useRef } from "react";
import type { ReactNode, SyntheticEvent } from "react";

import { Button } from "@/components/ui/button";
import type { ButtonVariant } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

type ConfirmDialogProps = {
  readonly children?: ReactNode;
  readonly confirmDisabled?: boolean;
  readonly confirmLabel: string;
  readonly description: string;
  readonly id: string;
  readonly onConfirm: () => void;
  readonly title: string;
  readonly tone?: "default" | "destructive";
  readonly triggerLabel: string;
  readonly triggerVariant?: ButtonVariant;
};

export function ConfirmDialog({
  children,
  confirmDisabled = false,
  confirmLabel,
  description,
  id,
  onConfirm,
  title,
  tone = "default",
  triggerLabel,
  triggerVariant = "secondary",
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    closeDialog();
  }

  function handleConfirm() {
    onConfirm();
    closeDialog();
  }

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function returnFocus() {
    triggerRef.current?.focus();
  }

  return (
    <>
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
        className="admin-dialog m-auto w-[min(28rem,calc(100%-2.5rem))] rounded-dialog border border-line bg-surface p-0 text-ink shadow-dialog backdrop:bg-overlay"
        id={id}
        onCancel={handleCancel}
        onClose={returnFocus}
        ref={dialogRef}
      >
        <div className="grid gap-5 p-5 sm:p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2">
            <h2
              className="text-section font-semibold text-ink-strong"
              id={`${id}-title`}
            >
              {title}
            </h2>
            <IconButton icon={XIcon} label="대화상자 닫기" onClick={closeDialog} />
            <p
              className="admin-keep-words col-span-2 text-body text-ink-subtle sm:col-span-1"
              id={`${id}-description`}
            >
              {description}
            </p>
          </div>
          {children ? <div>{children}</div> : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button autoFocus onClick={closeDialog} variant="secondary">
              취소
            </Button>
            <Button
              disabled={confirmDisabled}
              onClick={handleConfirm}
              variant={tone === "destructive" ? "destructive" : "primary"}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
