import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  ROOM_STATUSES,
  ROOM_STATUS_LABELS,
} from "@/features/rooms/constants";
import type { RoomSearch } from "@/features/rooms/list-schema";

type RoomFiltersProps = { readonly search: RoomSearch };

const statusOptions = [
  { label: "전체 상태", value: "" },
  ...ROOM_STATUSES.map((status) => ({
    label: ROOM_STATUS_LABELS[status],
    value: status,
  })),
];

const limitOptions = [10, 20, 50, 100].map((limit) => ({
  label: `${limit}개씩`,
  value: String(limit),
}));

export function RoomFilters({ search }: RoomFiltersProps) {
  return (
    <form
      action="/rooms"
      className="grid gap-4 rounded-panel border border-line bg-surface p-4 lg:grid-cols-[minmax(12rem,1fr)_minmax(16rem,1.5fr)_minmax(8rem,0.6fr)_auto] lg:items-end"
      method="get"
    >
      <input name="page" type="hidden" value="1" />
      <Select
        defaultValue={search.status ?? ""}
        id="rooms-status"
        label="상태"
        name="status"
        options={statusOptions}
      />
      <Input
        autoComplete="off"
        defaultValue={search.hostId ?? ""}
        hint="전체 UUID를 입력하세요."
        id="rooms-host-id"
        label="호스트 ID"
        name="hostId"
        placeholder="00000000-0000-0000-0000-000000000000"
      />
      <Select
        defaultValue={String(search.limit)}
        id="rooms-limit"
        label="페이지 크기"
        name="limit"
        options={limitOptions}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary">조회</Button>
        <Link
          className="admin-focus admin-interactive admin-control inline-flex items-center justify-center rounded-control border border-line bg-surface px-4 text-body font-semibold text-ink hover:border-line-strong hover:bg-surface-subtle"
          href="/rooms"
        >
          초기화
        </Link>
      </div>
    </form>
  );
}
