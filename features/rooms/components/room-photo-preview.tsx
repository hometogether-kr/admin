"use client";

import { XIcon } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useRoomMutationState } from "@/features/rooms/components/room-mutation-provider";
import { roomPhotoSource } from "@/features/rooms/photo-viewer";
import type { RoomMedia } from "@/features/rooms/registration-schema";

function PhotoFrame({
  source,
  filename,
  enlarged = false,
}: {
  readonly source: string | null;
  readonly filename: string;
  readonly enlarged?: boolean;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const failed = source === null || status === "error";
  return (
    <span
      className={`relative block w-full overflow-hidden rounded-control bg-surface-subtle ${enlarged ? "h-[min(65dvb,42rem)]" : "aspect-[4/3]"}`}
    >
      {failed ? (
        <span
          className="absolute inset-0 grid place-items-center p-4 text-center text-body text-ink-subtle"
          role="status"
        >
          사진을 불러오지 못했습니다. 사진을 다시 불러와 주세요.
        </span>
      ) : (
        <>
          <Image
            alt={filename}
            className="object-contain"
            fill
            onError={() => setStatus("error")}
            onLoad={() => setStatus("ready")}
            referrerPolicy="no-referrer"
            sizes={enlarged ? "90vw" : "(max-width: 1024px) 100vw, 50vw"}
            src={source}
            unoptimized
          />
          {status === "loading" ? (
            <span
              className="pointer-events-none absolute inset-0 grid place-items-center p-4 text-center text-body text-ink-subtle"
              role="status"
            >
              사진을 불러오는 중입니다.
            </span>
          ) : null}
        </>
      )}
    </span>
  );
}

export function RoomPhotoPreview({ media }: { readonly media: RoomMedia }) {
  const router = useRouter();
  const { busy, addressDirty } = useRoomMutationState();
  const [pending, startTransition] = useTransition();
  const [attempt, setAttempt] = useState(0);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const scrollOwnerRef = useRef<HTMLElement | null>(null);
  const previousOverflowRef = useRef("");
  const source = roomPhotoSource(media.readUrl);
  const imageKey = `${media.readUrl}:${attempt}`;
  const dialogId = `room-photo-${media.id}`;

  const restoreScroll = useCallback(() => {
    if (scrollOwnerRef.current !== null) {
      scrollOwnerRef.current.style.overflowY = previousOverflowRef.current;
      scrollOwnerRef.current = null;
    }
  }, []);
  useEffect(() => () => restoreScroll(), [restoreScroll]);

  function showPhoto() {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    dialog.showModal();
    setOpen(true);
    const owner = dialog.closest("main");
    if (owner instanceof HTMLElement) {
      previousOverflowRef.current = owner.style.overflowY;
      scrollOwnerRef.current = owner;
      owner.style.overflowY = "hidden";
    }
  }

  function refreshPhotos() {
    if (pending || busy || addressDirty) return;
    startTransition(() => {
      setAttempt((value) => value + 1);
      router.refresh();
    });
  }

  const refreshControl = (
    <Button
      disabled={busy || addressDirty}
      loading={pending}
      onClick={refreshPhotos}
    >
      {pending ? "불러오는 중" : "사진 다시 불러오기"}
    </Button>
  );
  const refreshNotice = addressDirty
    ? "주소 변경 내용을 저장한 뒤 사진을 다시 불러와 주세요."
    : "사진이 보이지 않으면 다시 불러와 주세요.";

  return (
    <div className="grid min-w-0 gap-3">
      <button
        aria-controls={dialogId}
        aria-haspopup="dialog"
        aria-label={`${media.originalFilename} 사진 확대 보기`}
        className="admin-focus block w-full overflow-hidden rounded-control border border-line disabled:cursor-not-allowed"
        disabled={source === null}
        onClick={showPhoto}
        ref={triggerRef}
        type="button"
      >
        <PhotoFrame
          filename={media.originalFilename}
          key={imageKey}
          source={source}
        />
        <span className="block px-3 py-2 text-compact font-semibold text-brand">
          사진 확대 보기
        </span>
      </button>
      <div className="grid justify-items-start gap-2">
        {refreshControl}
        <p className="text-compact text-ink-subtle">{refreshNotice}</p>
      </div>
      <dialog
        aria-labelledby={`${dialogId}-title`}
        className="admin-dialog m-auto max-h-[95dvb] w-[min(72rem,calc(100%-2rem))] overflow-y-auto rounded-dialog border border-line bg-surface p-4 text-ink shadow-dialog backdrop:bg-overlay sm:p-6"
        id={dialogId}
        onCancel={(event) => {
          event.preventDefault();
          dialogRef.current?.close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        onClose={() => {
          setOpen(false);
          restoreScroll();
          triggerRef.current?.focus();
        }}
        ref={dialogRef}
      >
        <div className="grid gap-4">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <h2
              className="admin-break-anywhere min-w-0 text-section font-semibold text-ink-strong"
              id={`${dialogId}-title`}
            >
              {media.originalFilename}
            </h2>
            <IconButton
              autoFocus
              icon={XIcon}
              label="사진 확대 보기 닫기"
              onClick={() => dialogRef.current?.close()}
            />
          </div>
          {open ? (
            <PhotoFrame
              enlarged
              filename={media.originalFilename}
              key={imageKey}
              source={source}
            />
          ) : null}
          <div className="grid justify-items-start gap-2">
            {refreshControl}
            <p className="text-compact text-ink-subtle">{refreshNotice}</p>
          </div>
        </div>
      </dialog>
    </div>
  );
}
