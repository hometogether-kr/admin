import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { RoomFilters } from "@/features/rooms/components/room-filters";
import { RoomsTable } from "@/features/rooms/components/rooms-table";
import { RoomMutationReceipt } from "@/features/rooms/mutation-receipt";
import {
  parseRoomSearch,
  roomListHref,
  type RoomSearchInput,
} from "@/features/rooms/list-schema";
import { readRooms } from "@/features/rooms/queries";

type RoomsPageProps = {
  readonly searchParams: Promise<RoomSearchInput>;
};

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const parsed = parseRoomSearch(await searchParams);
  if (!parsed.success) {
    return (
      <div className="grid gap-6">
        <PageHeader
          description="상태와 호스트를 기준으로 등록된 방을 조회하고 운영 상태를 관리합니다."
          title="방 관리"
        />
        <Alert title="조회 조건을 확인해 주세요." variant="error">
          페이지는 1 이상, 페이지 크기는 1~100, 호스트 ID는 UUID 형식이어야 합니다.
        </Alert>
        <Link
          className="admin-focus admin-control inline-flex w-fit items-center justify-center rounded-control border border-brand bg-brand px-4 text-body font-semibold text-ink-inverse"
          href="/rooms"
        >
          조건 초기화
        </Link>
      </div>
    );
  }

  const search = parsed.data;
  const returnTo = roomListHref(search, search.page);
  const result = await readRooms(search, returnTo);
  const totalPages = Math.max(result.totalPages, 1);

  return (
    <div className="grid gap-6">
      <PageHeader
        description="상태와 호스트를 기준으로 등록된 방을 조회하고 운영 상태를 관리합니다."
        eyebrow={`전체 ${new Intl.NumberFormat("ko-KR").format(result.total)}개`}
        title="방 관리"
      />
      <RoomMutationReceipt surface="list" />
      <RoomFilters search={search} />
      {result.items.length === 0 ? (
        <EmptyState
          action={
            <Link
              className="admin-focus admin-control inline-flex items-center justify-center rounded-control border border-line bg-surface px-4 text-body font-semibold text-ink"
              href="/rooms"
            >
              전체 방 보기
            </Link>
          }
          description="현재 조회 조건에 해당하는 방이 없습니다. 조건을 바꾸어 다시 조회해 보세요."
          title="방을 찾지 못했습니다"
        />
      ) : (
        <RoomsTable rooms={result.items} />
      )}
      <Pagination
        currentPage={result.page}
        firstHref={result.page > 1 ? roomListHref(search, 1) : undefined}
        lastHref={result.page < totalPages ? roomListHref(search, totalPages) : undefined}
        nextHref={result.page < totalPages ? roomListHref(search, result.page + 1) : undefined}
        previousHref={result.page > 1 ? roomListHref(search, result.page - 1) : undefined}
        totalPages={totalPages}
      />
    </div>
  );
}
