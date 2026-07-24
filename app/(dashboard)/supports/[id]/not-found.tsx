import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";

export default function SupportNotFound() {
  return (
    <EmptyState
      action={
        <Link
          className="admin-focus admin-interactive admin-control inline-flex items-center justify-center rounded-control border border-brand bg-brand px-4 text-body font-semibold text-ink-inverse hover:border-brand-hover hover:bg-brand-hover"
          href="/supports"
        >
          문의 목록으로 돌아가기
        </Link>
      }
      description="요청한 문의가 없거나 더 이상 조회할 수 없습니다."
      title="문의를 찾을 수 없습니다"
    />
  );
}
