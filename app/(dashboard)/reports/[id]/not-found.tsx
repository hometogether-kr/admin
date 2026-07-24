import Link from "next/link";

import { RouteState } from "@/components/admin/route-state";

export default function ReportNotFound() {
  return (
    <RouteState
      action={
        <Link
          className="admin-focus admin-interactive admin-control inline-flex items-center justify-center rounded-control border border-line bg-surface px-4 text-body font-semibold text-ink-strong hover:border-line-strong hover:bg-surface-subtle"
          href="/reports"
        >
          신고 목록으로 이동
        </Link>
      }
      code="404"
      description="요청한 신고가 없거나 더 이상 조회할 수 없습니다."
      title="신고를 찾을 수 없습니다"
    />
  );
}
