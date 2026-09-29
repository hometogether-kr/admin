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
  formatHostConsultationDateTime,
  hostConsultationHousingTypeLabel,
  hostConsultationRegionTypeLabel,
  hostConsultationStatusMeta,
} from "@/features/host-consultations/presentation";
import {
  hostConsultationListHref,
  type HostConsultationListQuery,
} from "@/features/host-consultations/query-state";
import type { HostConsultationList } from "@/features/host-consultations/schema";

const HOST_CONSULTATION_COLUMNS = [
  { key: "region", label: "상담 지역" },
  { key: "phone", label: "연락처" },
  { key: "roomCount", label: "방 개수" },
  { key: "housingType", label: "주택 형태" },
  { key: "status", label: "상태" },
  { key: "createdAt", label: "신청 시각" },
] as const satisfies readonly AdminTableColumn[];

type HostConsultationListViewProps = {
  readonly data: HostConsultationList;
  readonly query: HostConsultationListQuery;
};

export function HostConsultationListView({
  data,
  query,
}: HostConsultationListViewProps) {
  const totalPages = Math.max(1, data.totalPages);
  const rows: readonly AdminTableRow[] = data.items.map((consultation) => {
    const status = hostConsultationStatusMeta(consultation.status);
    return {
      key: consultation.id,
      cells: [
        <div className="grid gap-1" key="region">
          <Link
            className="admin-focus font-semibold text-brand underline-offset-4 hover:underline"
            href={`/host-consultations/${consultation.id}`}
          >
            {consultation.regionName}
          </Link>
          <span className="text-label text-ink-subtle">
            {hostConsultationRegionTypeLabel(consultation.regionType)}
          </span>
        </div>,
        <a
          className="admin-focus text-brand underline-offset-4 hover:underline"
          href={`tel:${consultation.normalizedPhone}`}
          key="phone"
        >
          {consultation.phone}
        </a>,
        `${consultation.roomCount}개`,
        hostConsultationHousingTypeLabel(consultation.housingType),
        <Badge key="status" variant={status.variant}>
          <span className="whitespace-nowrap">{status.label}</span>
        </Badge>,
        <time dateTime={consultation.createdAt} key="createdAt">
          {formatHostConsultationDateTime(consultation.createdAt)}
        </time>,
      ],
    };
  });

  return (
    <div className="grid gap-4">
      <p aria-live="polite" className="text-compact text-ink-subtle">
        총{" "}
        <strong className="text-ink-strong">
          {data.total.toLocaleString("ko-KR")}
        </strong>
        건
      </p>
      <TableShell
        caption="상담 신청 목록"
        columns={HOST_CONSULTATION_COLUMNS}
        empty={
          <EmptyState
            description="현재 필터 조건에 해당하는 상담 신청이 없습니다."
            title="상담 신청이 없습니다"
          />
        }
        rows={rows}
      />
      <Pagination
        currentPage={data.page}
        firstHref={
          data.page > 1 ? hostConsultationListHref(query, 1) : undefined
        }
        lastHref={
          data.page < totalPages
            ? hostConsultationListHref(query, totalPages)
            : undefined
        }
        nextHref={
          data.page < totalPages
            ? hostConsultationListHref(query, data.page + 1)
            : undefined
        }
        previousHref={
          data.page > 1
            ? hostConsultationListHref(query, data.page - 1)
            : undefined
        }
        totalPages={totalPages}
      />
    </div>
  );
}
