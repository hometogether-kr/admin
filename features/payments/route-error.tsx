"use client";

import { RouteState } from "@/components/admin/route-state";

export function PaymentRouteError({ reset }: { readonly reset: () => void }) {
  return (
    <RouteState
      action={
        <button
          className="admin-focus admin-interactive admin-control inline-flex items-center justify-center rounded-control border border-brand bg-brand px-4 text-body font-semibold text-ink-inverse hover:border-brand-hover hover:bg-brand-hover"
          onClick={reset}
          type="button"
        >
          다시 시도
        </button>
      }
      code="ERROR"
      description="결제 화면을 표시하지 못했습니다. 잠시 후 다시 시도해 주세요."
      title="결제 화면 오류"
    />
  );
}
