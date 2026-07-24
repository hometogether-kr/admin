import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import {
  type AdminTableColumn,
  type AdminTableRow,
  TableShell,
} from "@/components/ui/table-shell";
import {
  formatSupportDateTime,
  supportInquiryTypeLabel,
  supportStatusMeta,
} from "@/features/supports/presentation";
import {
  supportListHref,
  type SupportListQuery,
} from "@/features/supports/query-state";
import type { SupportList } from "@/features/supports/schema";

const SUPPORT_COLUMNS = [
  { key: "supportId", kind: "identifier", label: "문의 ID" },
  { key: "userId", kind: "identifier", label: "사용자 ID" },
  { key: "inquiryType", label: "문의 유형" },
  { key: "status", label: "상태" },
  { key: "createdAt", label: "접수 시각" },
] as const satisfies readonly AdminTableColumn[];

type SupportListViewProps = {
  readonly data: SupportList;
  readonly query: SupportListQuery;
};

export function SupportListView({ data, query }: SupportListViewProps) {
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));
  const rows: readonly AdminTableRow[] = data.items.map((support) => {
    const status = supportStatusMeta(support.status);
    return {
      key: support.id,
      cells: [
        <Link
          className="admin-focus font-semibold text-brand underline-offset-4 hover:underline"
          href={`/supports/${support.id}`}
          key="supportId"
        >
          {support.id}
        </Link>,
        <span key="userId">{support.userId ?? "익명 문의"}</span>,
        supportInquiryTypeLabel(support.inquiryType),
        <Badge key="status" variant={status.variant}>
          <span className="whitespace-nowrap">{status.label}</span>
        </Badge>,
        <time dateTime={support.createdAt} key="createdAt">
          {formatSupportDateTime(support.createdAt)}
        </time>,
      ],
    };
  });

  return (
    <div className="grid gap-4">
      <p aria-live="polite" className="text-compact text-ink-subtle">
        총 <strong className="text-ink-strong">{data.total.toLocaleString("ko-KR")}</strong>건
      </p>
      <TableShell
        caption="고객 문의 목록"
        columns={SUPPORT_COLUMNS}
        empty={
          <EmptyState
            description="현재 필터 조건에 해당하는 고객 문의가 없습니다."
            title="문의가 없습니다"
          />
        }
        rows={rows}
      />
      <Pagination
        currentPage={data.page}
        firstHref={data.page > 1 ? supportListHref(query, 1) : undefined}
        lastHref={
          data.page < totalPages
            ? supportListHref(query, totalPages)
            : undefined
        }
        nextHref={
          data.page < totalPages
            ? supportListHref(query, data.page + 1)
            : undefined
        }
        previousHref={
          data.page > 1
            ? supportListHref(query, data.page - 1)
            : undefined
        }
        totalPages={totalPages}
      />
    </div>
  );
}
