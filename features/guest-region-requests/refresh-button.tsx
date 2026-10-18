"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function GuestRegionRefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      loading={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {pending ? "불러오는 중" : "새로고침"}
    </Button>
  );
}
