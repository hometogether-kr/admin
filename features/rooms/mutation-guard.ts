import type { AdminActionResult } from "@/lib/actions/result";

export type RoomMutationAction = (previous: AdminActionResult, formData: FormData) => Promise<AdminActionResult>;

export function createRoomMutationGuard(onBusy: (busy: boolean) => void) {
  let busy = false;
  return {
    async run(action: RoomMutationAction, previous: AdminActionResult, formData: FormData): Promise<AdminActionResult> {
      if (busy) return { kind: "error", message: "다른 작업을 처리 중입니다. 완료 후 다시 시도해 주세요." };
      busy = true;
      onBusy(true);
      try { return await action(previous, formData); }
      finally { busy = false; onBusy(false); }
    },
  };
}
