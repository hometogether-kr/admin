"use client";

import { PageHeader } from "@/components/admin/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type RoomsErrorProps = {
  readonly error: Error & { readonly digest?: string };
  readonly unstable_retry: () => void;
};

export default function RoomsError({ unstable_retry }: RoomsErrorProps) {
  return (
    <div className="grid gap-6">
      <PageHeader title="방 관리" />
      <Alert title="방 목록을 불러오지 못했습니다." variant="error">
        응답을 안전하게 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.
      </Alert>
      <Button className="w-fit" onClick={unstable_retry} variant="primary">다시 시도</Button>
    </div>
  );
}
