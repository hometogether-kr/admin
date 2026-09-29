import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";

export default function HostConsultationNotFound() {
  return (
    <EmptyState
      action={
        <Link
          className="admin-focus admin-interactive admin-control inline-flex items-center justify-center rounded-control border border-brand bg-brand px-4 text-body font-semibold text-ink-inverse hover:border-brand-hover hover:bg-brand-hover"
          href="/host-consultations"
        >
          상담 신청 목록으로 돌아가기
        </Link>
      }
      description="요청한 상담 신청이 없거나 더 이상 조회할 수 없습니다."
      title="상담 신청을 찾을 수 없습니다"
    />
  );
}
