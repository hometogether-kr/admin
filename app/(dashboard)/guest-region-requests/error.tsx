"use client";

import { useTransition } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function GuestRegionRequestsError({
  unstable_retry,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly unstable_retry: () => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="grid gap-6">
      <PageHeader
        title="게스트 희망 지역 요청"
        description="접수 내역을 가져오지 못했습니다."
      />
      <Alert title="희망 지역 요청을 표시할 수 없습니다" variant="error">
        잠시 후 다시 시도해 주세요. 문제가 계속되면 관리자 권한과 API 상태를
        확인해 주세요.
      </Alert>
      <div>
        <Button
          loading={pending}
          onClick={() => startTransition(() => unstable_retry())}
          variant="primary"
        >
          다시 시도
        </Button>
      </div>
    </div>
  );
}
