"use client";

import { RouteState } from "@/components/admin/route-state";

type ErrorBoundaryProps = {
  readonly error: Error & { readonly digest?: string };
  readonly unstable_retry: () => void;
};

export default function ErrorBoundary({
  unstable_retry,
}: ErrorBoundaryProps) {
  return (
    <main className="flex min-h-[100dvb] flex-1 flex-col">
      <RouteState
        action={
          <button
            className="admin-focus admin-interactive admin-control inline-flex items-center justify-center rounded-control border border-brand bg-brand px-4 text-body font-semibold text-ink-inverse hover:border-brand-hover hover:bg-brand-hover active:border-brand-pressed active:bg-brand-pressed"
            onClick={unstable_retry}
            type="button"
          >
            다시 시도
          </button>
        }
        code="ERROR"
        description="예상하지 못한 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
        title="화면을 표시하지 못했습니다"
      />
    </main>
  );
}
