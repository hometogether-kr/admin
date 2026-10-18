"use client";

import { useActionState } from "react";

import { ActionFeedback } from "@/components/admin/action-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateRoomCore } from "@/features/rooms/actions";
import { RoomMutationCompletion } from "@/features/rooms/mutation-receipt";
import { INITIAL_ADMIN_ACTION_RESULT } from "@/lib/actions/result";
import { useRoomMutationAction } from "@/features/rooms/components/room-mutation-provider";
import { krwToManwonInput } from "@/features/rooms/format";

type RoomCoreEditFormProps = {
  readonly depositKrw: number | null;
  readonly description: string | null;
  readonly maintenanceFeeKrw: number | null;
  readonly monthlyRentKrw: number | null;
  readonly roomId: string;
};

export function RoomCoreEditForm({
  depositKrw,
  description,
  maintenanceFeeKrw,
  monthlyRentKrw,
  roomId,
}: RoomCoreEditFormProps) {
  const mutation = useRoomMutationAction(updateRoomCore.bind(null, roomId));
  const [result, submit, pending] = useActionState(
    mutation.action,
    INITIAL_ADMIN_ACTION_RESULT,
  );

  return (
    <section aria-labelledby="room-core-edit-heading" className="grid gap-4 border-t border-line-subtle pt-6">
      <div className="grid gap-1">
        <h2 className="text-section font-semibold text-ink-strong" id="room-core-edit-heading">
          핵심 정보 수정
        </h2>
        <p className="admin-keep-words text-body text-ink-subtle">
          호스트 등록 계약은 유지하고 가격과 매물 설명만 수정합니다.
        </p>
      </div>
      <form action={submit} className="grid items-start gap-4 rounded-panel border border-line-subtle bg-surface p-4 sm:grid-cols-3">
        <RoomMutationCompletion result={result} roomId={roomId} />
        <fieldset className="contents" disabled={pending || mutation.busy}>
          <Input defaultValue={krwToManwonInput(monthlyRentKrw)} id="room-monthly-rent" label="월세(만원)" max={10_000} min={0.0001} name="monthlyRentManwon" required step={0.0001} type="number" />
          <Input defaultValue={krwToManwonInput(depositKrw)} id="room-deposit" label="보증금(만원)" max={100_000} min={0} name="depositManwon" required step={0.0001} type="number" />
          <Input defaultValue={krwToManwonInput(maintenanceFeeKrw)} id="room-maintenance-fee" label="관리비(만원)" max={100_000} min={0} name="maintenanceFeeManwon" required step={0.0001} type="number" />
          <div className="sm:col-span-3">
            <Textarea defaultValue={description ?? ""} id="room-description" label="매물 설명" maxLength={2_000} name="description" />
          </div>
          <div className="grid gap-3 sm:col-span-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <ActionFeedback result={result} />
            <Button className="sm:col-start-2 sm:row-start-1" loading={pending} type="submit" variant="primary">
              핵심 정보 저장
            </Button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
