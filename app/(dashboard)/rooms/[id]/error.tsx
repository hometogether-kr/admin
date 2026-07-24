"use client";

import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type RoomDetailErrorProps = {
  readonly error: Error & { readonly digest?: string };
  readonly unstable_retry: () => void;
};

export default function RoomDetailError({ unstable_retry }: RoomDetailErrorProps) {
  return (
    <div className="grid gap-6">
      <PageHeader title="방 상세" />
      <Alert title="방 상세 정보를 불러오지 못했습니다." variant="error">
        응답을 안전하게 확인할 수 없습니다. 원문 응답은 화면에 표시하지 않습니다.
      </Alert>
      <div className="flex flex-wrap gap-2">
        <Button onClick={unstable_retry} variant="primary">다시 시도</Button>
        <Link
          className="admin-focus admin-control inline-flex items-center justify-center rounded-control border border-line bg-surface px-4 text-body font-semibold text-ink"
          href="/rooms"
        >
          목록으로
        </Link>
      </div>
    </div>
  );
}
