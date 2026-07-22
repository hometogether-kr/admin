"use client";

import { CopyIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";

import { IconButton } from "@/components/ui/icon-button";
import type { UserId } from "@/features/users/contracts";

type CopyState = "idle" | "copied" | "failed";

type CopyableUserIdProps = {
  readonly value: UserId;
};

export function CopyableUserId({ value }: CopyableUserIdProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  async function copyUserId(): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setCopyState("copied");
    } catch (cause) {
      if (cause instanceof Error) {
        setCopyState("failed");
        return;
      }
      throw cause;
    }
  }

  const status = copyState === "copied"
    ? "사용자 ID를 복사했습니다."
    : copyState === "failed"
      ? "사용자 ID를 복사하지 못했습니다."
      : "";

  return (
    <span className="relative inline-flex max-w-full items-start gap-1">
      <code className="admin-break-anywhere min-w-0 font-mono text-compact tabular-nums">
        {value}
      </code>
      <IconButton
        className="-my-1 shrink-0"
        icon={CopyIcon}
        label="사용자 ID 복사"
        onClick={copyUserId}
      />
      <span aria-live="polite" className="sr-only">
        {status}
      </span>
    </span>
  );
}
