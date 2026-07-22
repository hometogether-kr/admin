"use client";

import { RouteState } from "@/components/admin/route-state";
import { Button } from "@/components/ui/button";

type UsersErrorProps = {
  readonly error: Error & { readonly digest?: string };
  readonly unstable_retry: () => void;
};

export default function UsersError({ unstable_retry }: UsersErrorProps) {
  return (
    <RouteState
      action={
        <Button onClick={unstable_retry} variant="primary">
          다시 시도
        </Button>
      }
      code="USERS"
      description="잠시 후 다시 시도해 주세요."
      title="사용자 조회 실패"
    />
  );
}
