import Link from "next/link";

import { RouteState } from "@/components/admin/route-state";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvb] flex-1 flex-col">
      <RouteState
        action={
          <Link
            className="admin-focus admin-interactive admin-control inline-flex items-center justify-center rounded-control border border-line bg-surface px-4 text-body font-semibold text-ink-strong hover:border-line-strong hover:bg-surface-subtle"
            href="/"
          >
            처음으로 돌아가기
          </Link>
        }
        code="404"
        description="요청한 페이지가 없거나 주소가 변경되었습니다."
        title="페이지를 찾을 수 없습니다"
      />
    </main>
  );
}
