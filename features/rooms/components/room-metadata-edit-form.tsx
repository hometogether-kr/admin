"use client";

import { FloppyDiskIcon } from "@phosphor-icons/react/ssr";
import { useActionState, useState } from "react";

import { ActionFeedback } from "@/components/admin/action-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateRoomMetadata } from "@/features/rooms/actions";
import type { RoomMetadataValues } from "@/features/rooms/action-schema";
import { RoomMutationCompletion } from "@/features/rooms/mutation-receipt";
import { INITIAL_ADMIN_ACTION_RESULT } from "@/lib/actions/result";

type RoomMetadataEditFormProps = RoomMetadataValues & { readonly roomId: string };

export function RoomMetadataEditForm({ roomId, subtitle, floor }: RoomMetadataEditFormProps) {
  const [subtitleInput, setSubtitleInput] = useState(subtitle ?? "");
  const [floorInput, setFloorInput] = useState(floor === null ? "" : String(floor));
  const [result, submit, pending] = useActionState(
    updateRoomMetadata.bind(null, roomId, { subtitle, floor }),
    INITIAL_ADMIN_ACTION_RESULT,
  );

  return (
    <section aria-labelledby="room-metadata-heading" className="grid gap-4 border-t border-line-subtle pt-6">
      <h2 className="text-section font-semibold text-ink-strong" id="room-metadata-heading">소제목·층수</h2>
      <form action={submit} className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <RoomMutationCompletion result={result} roomId={roomId} />
        <Input id="room-subtitle" label="소제목" maxLength={200} name="subtitle" onChange={(event) => setSubtitleInput(event.target.value)} value={subtitleInput} />
        <Input id="room-floor" label="층수" min={-2147483648} max={2147483647} name="floor" onChange={(event) => setFloorInput(event.target.value)} step={1} type="number" value={floorInput} />
        <div className="flex flex-wrap items-start justify-end gap-3 sm:col-span-2">
          <div className="min-w-0 flex-1"><ActionFeedback result={result} /></div>
          <Button icon={FloppyDiskIcon} loading={pending} type="submit" variant="primary">소제목·층수 저장</Button>
        </div>
      </form>
    </section>
  );
}
