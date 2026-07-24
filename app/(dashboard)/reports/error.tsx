"use client";

import { RouteState } from "@/components/admin/route-state";
import { Button } from "@/components/ui/button";

type ReportsErrorProps = {
  readonly error: Error & { readonly digest?: string };
  readonly unstable_retry: () => void;
};

export default function ReportsError({ unstable_retry }: ReportsErrorProps) {
  return (
    <RouteState
      action={
        <Button onClick={unstable_retry} type="button" variant="primary">
          다시 시도
        </Button>
      }
      code="REPORTS_ERROR"
      description="신고 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
      title="신고 화면을 표시하지 못했습니다"
    />
  );
}
