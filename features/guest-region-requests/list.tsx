import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import {
  TableShell,
  type AdminTableColumn,
  type AdminTableRow,
} from "@/components/ui/table-shell";
import { formatGuestRegionDateTime } from "./presentation";
import { guestRegionListHref, type GuestRegionListQuery } from "./query-state";
import type { GuestRegionRequestList } from "./schema";

const columns = [
  { key: "region", label: "희망 지역" },
  { key: "createdAt", label: "접수 시각 (한국 시간)" },
] as const satisfies readonly AdminTableColumn[];

export function GuestRegionRequestListView({
  data,
  query,
}: {
  readonly data: GuestRegionRequestList;
  readonly query: GuestRegionListQuery;
}) {
  const totalPages = Math.max(1, data.totalPages);
  const rows: readonly AdminTableRow[] = data.items.map((request) => ({
    key: request.id,
    cells: [
      <span
        className="admin-break-anywhere whitespace-pre-wrap font-semibold text-ink-strong"
        key="region"
      >
        {request.region}
      </span>,
      <time dateTime={request.createdAt} key="createdAt">
        {formatGuestRegionDateTime(request.createdAt)}
      </time>,
    ],
  }));
  return (
    <div className="grid gap-4">
      <p aria-live="polite" className="text-compact text-ink-subtle">
        총{" "}
        <strong className="text-ink-strong">
          {data.total.toLocaleString("ko-KR")}
        </strong>
        건 · 최신 접수순
      </p>
      <TableShell
        caption="게스트 희망 지역 요청 목록"
        columns={columns}
        rows={rows}
        empty={
          <EmptyState
            title="접수된 희망 지역 요청이 없습니다"
            description="새로운 요청이 접수되면 이곳에서 확인할 수 있습니다."
          />
        }
      />
      <Pagination
        currentPage={data.page}
        totalPages={totalPages}
        firstHref={data.page > 1 ? guestRegionListHref(query, 1) : undefined}
        previousHref={
          data.page > 1 ? guestRegionListHref(query, data.page - 1) : undefined
        }
        nextHref={
          data.page < totalPages
            ? guestRegionListHref(query, data.page + 1)
            : undefined
        }
        lastHref={
          data.page < totalPages
            ? guestRegionListHref(query, totalPages)
            : undefined
        }
      />
    </div>
  );
}
