"use client";

import { RouteState } from "@/components/admin/route-state";
import { Button } from "@/components/ui/button";

type ReservationErrorProps = {
  readonly error: Error & { readonly digest?: string };
  readonly unstable_retry: () => void;
};

export default function ReservationError({
  unstable_retry,
}: ReservationErrorProps) {
  return (
    <RouteState
      action={
        <Button onClick={unstable_retry} type="button" variant="primary">
          다시 시도
        </Button>
      }
      code="ERROR"
      description="예약 정보를 불러오지 못했습니다. 잠시 후 재시도해 주세요."
      title="예약 목록 오류"
    />
  );
}
