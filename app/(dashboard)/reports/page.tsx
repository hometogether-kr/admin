import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { TableShell } from "@/components/ui/table-shell";
import type { AdminTableColumn } from "@/components/ui/table-shell";
import {
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  REPORT_TARGET_TYPES,
  REPORT_TARGET_TYPE_LABELS,
} from "@/features/reports/constants";
import {
  formatReportTimestamp,
  ReportStatusBadge,
} from "@/features/reports/report-view";
import {
  parseReportListQuery,
  type ReportListQuery,
} from "@/features/reports/schemas";
import { readReports, reportsHref } from "@/features/reports/queries";

export const metadata: Metadata = { title: "신고 관리" };

type ReportsPageProps = {
  readonly searchParams: Promise<
    Record<string, string | readonly string[] | undefined>
  >;
};

const REPORT_COLUMNS = [
  { key: "id", kind: "identifier", label: "신고 ID" },
  { key: "target", label: "대상 유형 / ID" },
  { key: "reporterId", kind: "identifier", label: "신고자 ID" },
  { key: "status", label: "상태" },
  { key: "createdAt", label: "접수 일시" },
] as const satisfies readonly AdminTableColumn[];

function paginationHref(
  query: ReportListQuery,
  page: number,
): string {
  return reportsHref({ ...query, page });
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const query = parseReportListQuery(await searchParams);
  const reports = await readReports(query);
  const totalPages = Math.max(1, reports.totalPages);
  const rows = reports.items.map((report) => ({
    key: report.id,
    cells: [
      <Link
        className="admin-focus admin-break-anywhere rounded-sm font-semibold text-brand hover:text-brand-hover"
        href={`/reports/${report.id}`}
        key="id"
        prefetch={false}
      >
        {report.id}
      </Link>,
      <div className="grid min-w-0 gap-1" key="target">
        <Badge className="justify-self-start whitespace-nowrap">
          {REPORT_TARGET_TYPE_LABELS[report.targetType]}
        </Badge>
        <span className="admin-break-anywhere font-mono tabular-nums text-compact">
          {report.targetId}
        </span>
      </div>,
      report.reporterId,
      <ReportStatusBadge key="status" status={report.status} />,
      <time
        className="whitespace-nowrap"
        dateTime={report.createdAt}
        key="createdAt"
      >
        {formatReportTimestamp(report.createdAt)}
      </time>,
    ],
  }));

  return (
    <div className="grid gap-6">
      <PageHeader
        description="접수된 신고를 대상과 상태별로 확인하고 처리합니다."
        title="신고 관리"
      />

      <form
        action="/reports"
        aria-label="신고 목록 필터"
        className="grid items-end gap-4 rounded-panel border border-line-subtle bg-surface-subtle p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,10rem)_auto]"
        method="get"
      >
        <input name="page" type="hidden" value="1" />
        <Select
          defaultValue={query.status ?? ""}
          id="report-status-filter"
          label="신고 상태"
          name="status"
          options={[
            { label: "전체 상태", value: "" },
            ...REPORT_STATUSES.map((value) => ({
              label: REPORT_STATUS_LABELS[value],
              value,
            })),
          ]}
        />
        <Select
          defaultValue={query.targetType ?? ""}
          id="report-target-type-filter"
          label="대상 유형"
          name="targetType"
          options={[
            { label: "전체 유형", value: "" },
            ...REPORT_TARGET_TYPES.map((value) => ({
              label: REPORT_TARGET_TYPE_LABELS[value],
              value,
            })),
          ]}
        />
        <Select
          defaultValue={String(query.limit)}
          id="report-limit-filter"
          label="페이지당 개수"
          name="limit"
          options={[10, 20, 50, 100].map((value) => ({
            label: `${value}개`,
            value: String(value),
          }))}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary">
            필터 적용
          </Button>
          <Link
            className="admin-focus admin-control admin-interactive inline-flex items-center justify-center rounded-control border border-line bg-surface px-4 text-body font-semibold text-ink-strong hover:border-line-strong hover:bg-surface-muted"
            href="/reports"
          >
            초기화
          </Link>
        </div>
      </form>

      <section aria-labelledby="reports-list-title" className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="grid gap-1">
            <h2
              className="text-section font-semibold text-ink-strong"
              id="reports-list-title"
            >
              신고 목록
            </h2>
            <p className="text-body text-ink-subtle">
              총 {reports.total.toLocaleString("ko-KR")}건
            </p>
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            description="현재 필터 조건에 해당하는 신고가 없습니다."
            title="신고를 찾지 못했습니다"
          />
        ) : (
          <TableShell
            caption="신고 목록"
            columns={REPORT_COLUMNS}
            rows={rows}
          />
        )}

        <Pagination
          currentPage={reports.page}
          firstHref={reports.page > 1 ? paginationHref(query, 1) : undefined}
          lastHref={
            reports.page < totalPages
              ? paginationHref(query, totalPages)
              : undefined
          }
          nextHref={
            reports.page < totalPages
              ? paginationHref(query, reports.page + 1)
              : undefined
          }
          previousHref={
            reports.page > 1
              ? paginationHref(query, reports.page - 1)
              : undefined
          }
          totalPages={totalPages}
        />
      </section>
    </div>
  );
}
