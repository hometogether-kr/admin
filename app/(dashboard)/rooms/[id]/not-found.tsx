import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";

export default function RoomDetailNotFound() {
  return (
    <EmptyState
      action={
        <Link
          className="admin-focus admin-control inline-flex items-center justify-center rounded-control border border-brand bg-brand px-4 text-body font-semibold text-ink-inverse"
          href="/rooms"
        >
          방 목록으로
        </Link>
      }
      description="삭제되었거나 존재하지 않는 방입니다. 목록에서 다시 확인해 주세요."
      title="방을 찾을 수 없습니다"
    />
  );
}
