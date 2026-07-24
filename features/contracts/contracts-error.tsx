import Link from "next/link";

import { RouteState } from "@/components/admin/route-state";

export function ContractsErrorState() {
  return (
    <RouteState
      action={
        <Link
          className="admin-focus admin-interactive admin-control inline-flex items-center justify-center rounded-control border border-brand bg-brand px-4 text-body font-semibold text-ink-inverse hover:border-brand-hover hover:bg-brand-hover active:border-brand-pressed active:bg-brand-pressed"
          href="/contracts"
        >
          다시 시도
        </Link>
      }
      code="ERROR"
      description="잠시 후 재시도하세요."
      title="계약 화면 오류"
    />
  );
}
