import Link from "next/link";

import { RouteState } from "@/components/admin/route-state";

export default function UserNotFound() {
  return (
    <RouteState
      action={
        <Link
          className="admin-focus admin-interactive admin-control inline-flex items-center justify-center rounded-control border border-line bg-surface px-4 text-body font-semibold text-ink-strong hover:border-line-strong hover:bg-surface-subtle"
          href="/users"
        >
          사용자 목록으로 이동
        </Link>
      }
      code="404"
      description="사용자가 없거나 비활성 상태입니다."
      title="사용자를 찾을 수 없습니다"
    />
  );
}
