"use client";

import { XIcon } from "@phosphor-icons/react/ssr";
import {
  cloneElement,
  isValidElement,
  useActionState,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { useRouter } from "next/navigation";

import { ActionFeedback } from "@/components/admin/action-feedback";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
  INITIAL_ADMIN_ACTION_RESULT,
  type AdminActionResult,
} from "@/lib/actions/result";

export type RoomServerAction = (
  previousState: AdminActionResult,
  formData: FormData,
) => Promise<AdminActionResult>;

type ConfirmedActionProps = {
  readonly action: RoomServerAction;
  readonly children?: ReactNode;
  readonly confirmLabel: string;
  readonly description: string;
  readonly id: string;
  readonly title: string;
  readonly tone?: "default" | "destructive";
  readonly triggerLabel: string;
  readonly triggerVariant?: ButtonVariant;
  readonly trimmedRequiredField?: {
    readonly message: string;
    readonly name: string;
  };
};

export function ConfirmedAction({
  action,
  children,
  confirmLabel,
  description,
  id,
  title,
  tone,
  triggerLabel,
  triggerVariant,
  trimmedRequiredField,
}: ConfirmedActionProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [fieldError, setFieldError] = useState<string>();
  const [result, submit, pending] = useActionState(
    action,
    INITIAL_ADMIN_ACTION_RESULT,
  );

  useEffect(() => {
    switch (result.kind) {
      case "success":
        router.refresh();
        return;
      case "idle":
      case "error":
        return;
      default:
        result satisfies never;
    }
  }, [result, router]);

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    closeDialog();
  }

  function handleConfirm() {
    if (trimmedRequiredField !== undefined) {
      const field = formRef.current?.elements.namedItem(trimmedRequiredField.name);
      if (!(field instanceof HTMLTextAreaElement) || field.value.trim() === "") {
        setFieldError(trimmedRequiredField.message);
        if (field instanceof HTMLTextAreaElement) field.focus();
        return;
      }
    }
    setFieldError(undefined);
    formRef.current?.requestSubmit();
    closeDialog();
  }

  function openDialog() {
    setFieldError(undefined);
    dialogRef.current?.showModal();
  }

  const dialogChildren = fieldError !== undefined
    && isValidElement<{ readonly error?: string }>(children)
    ? cloneElement(children, { error: fieldError })
    : children;

  return (
    <form action={submit} className="grid gap-2" ref={formRef}>
      <Button onClick={openDialog} ref={triggerRef} variant={triggerVariant}>
        {triggerLabel}
      </Button>
      <dialog
        aria-describedby={`${id}-description`}
        aria-labelledby={`${id}-title`}
        className="admin-dialog m-auto w-[min(28rem,calc(100%-2.5rem))] rounded-dialog border border-line bg-surface p-0 text-ink shadow-dialog backdrop:bg-overlay"
        id={id}
        onCancel={handleCancel}
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <div className="grid gap-5 p-5 sm:p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2">
            <h2 className="text-section font-semibold text-ink-strong" id={`${id}-title`}>
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
          {dialogChildren ? <div>{dialogChildren}</div> : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button autoFocus onClick={closeDialog} variant="secondary">
              취소
            </Button>
            <Button
              disabled={pending}
              onClick={handleConfirm}
              variant={tone === "destructive" ? "destructive" : "primary"}
            >
              {pending ? "처리 중" : confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
      <ActionFeedback result={result} />
    </form>
  );
}
