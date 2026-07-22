import Link from "next/link";

import { RouteState } from "@/components/admin/route-state";

export default function PaymentsNotFound() {
  return (
    <RouteState
      action={
        <Link
          className="admin-focus admin-interactive admin-control inline-flex items-center justify-center rounded-control border border-line bg-surface px-4 text-body font-semibold text-ink-strong hover:border-line-strong hover:bg-surface-subtle"
          href="/payments"
        >
          결제 목록으로 돌아가기
        </Link>
      }
      code="404"
      description="요청한 결제 내역이 없거나 삭제되었습니다."
      title="결제를 찾을 수 없습니다"
    />
  );
}
