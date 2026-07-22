import Link from "next/link";

import { RouteState } from "@/components/admin/route-state";

export default function Forbidden() {
  return (
    <main className="flex min-h-[100dvb] flex-1 flex-col">
      <RouteState
        action={
          <Link
            className="admin-focus admin-interactive admin-control inline-flex items-center justify-center rounded-control border border-line bg-surface px-4 text-body font-semibold text-ink-strong hover:border-line-strong hover:bg-surface-subtle"
            href="/"
          >
            허용된 업무로 이동
          </Link>
        }
        code="403"
        description="현재 역할로는 이 업무를 볼 수 없습니다."
        title="접근할 수 없습니다"
      />
    </main>
  );
}
