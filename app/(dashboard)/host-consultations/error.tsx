"use client";

import { PageHeader } from "@/components/admin/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type HostConsultationsErrorProps = {
  readonly error: Error & { readonly digest?: string };
  readonly unstable_retry: () => void;
};

export default function HostConsultationsError({
  unstable_retry,
}: HostConsultationsErrorProps) {
  return (
    <div className="grid gap-6">
      <PageHeader
        description="상담 신청 데이터를 가져오지 못했습니다."
        title="상담 신청"
      />
      <Alert title="상담 신청을 표시할 수 없습니다" variant="error">
        잠시 후 다시 시도해 주세요. 문제가 계속되면 관리자 권한과 API 상태를 확인해 주세요.
      </Alert>
      <div>
        <Button onClick={unstable_retry} variant="primary">
          다시 시도
        </Button>
      </div>
    </div>
  );
}
