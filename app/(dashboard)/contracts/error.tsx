"use client";

import { RouteState } from "@/components/admin/route-state";
import { Button } from "@/components/ui/button";

type ContractsErrorProps = {
  readonly error: Error & { readonly digest?: string };
  readonly unstable_retry: () => void;
};

export default function ContractsError({ unstable_retry }: ContractsErrorProps) {
  return (
    <RouteState
      action={
        <Button onClick={unstable_retry} variant="primary">
          다시 시도
        </Button>
      }
      code="ERROR"
      description="잠시 후 재시도하세요."
      title="계약 화면 오류"
    />
  );
}
