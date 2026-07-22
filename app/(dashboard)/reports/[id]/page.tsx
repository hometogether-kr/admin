import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { DefinitionList } from "@/components/ui/definition-list";
import type { DefinitionItem } from "@/components/ui/definition-list";
import { REPORT_TARGET_TYPE_LABELS } from "@/features/reports/constants";
import { readReport } from "@/features/reports/queries";
import { ResolutionForm } from "@/features/reports/resolution-form";
import { reportIdSchema, type Report } from "@/features/reports/schemas";
import {
  EvidenceUrlList,
  formatReportTimestamp,
  ReportStatusBadge,
} from "@/features/reports/report-view";
import { AdminApiError } from "@/lib/api/errors";

export const metadata: Metadata = { title: "신고 상세" };

type ReportDetailPageProps = {
  readonly params: Promise<{ readonly id: string }>;
};

export default async function ReportDetailPage({
  params,
}: ReportDetailPageProps) {
  const parsedId = reportIdSchema.safeParse((await params).id);
  if (!parsedId.success) notFound();

  let report: Report;
  try {
    report = await readReport(parsedId.data);
  } catch (cause) {
    if (cause instanceof AdminApiError && cause.status === 404) notFound();
    throw cause;
  }

  const summaryItems: readonly DefinitionItem[] = [
    { label: "신고 ID", value: report.id },
    { label: "상태", value: <ReportStatusBadge status={report.status} /> },
    { label: "대상 유형", value: REPORT_TARGET_TYPE_LABELS[report.targetType] },
    { label: "대상 ID", value: report.targetId },
    { label: "신고자 ID", value: report.reporterId },
    {
      label: "신고 사유",
      value: (
        <span className="admin-keep-words whitespace-pre-wrap">
          {report.reason}
        </span>
      ),
    },
  ];
  const resolutionItems: readonly DefinitionItem[] = [
    {
      label: "처리 메모",
      value: report.resolutionMemo ? (
        <span className="admin-keep-words whitespace-pre-wrap">
          {report.resolutionMemo}
        </span>
      ) : (
        "기록 없음"
      ),
    },
    { label: "처리 관리자 ID", value: report.resolvedBy ?? "기록 없음" },
    {
      label: "처리 일시",
      value: report.resolvedAt ? (
        <time dateTime={report.resolvedAt}>
          {formatReportTimestamp(report.resolvedAt)}
        </time>
      ) : (
        "기록 없음"
      ),
    },
    {
      label: "접수 일시",
      value: (
        <time dateTime={report.createdAt}>
          {formatReportTimestamp(report.createdAt)}
        </time>
      ),
    },
    {
      label: "최근 수정 일시",
      value: (
        <time dateTime={report.updatedAt}>
          {formatReportTimestamp(report.updatedAt)}
        </time>
      ),
    },
  ];

  return (
    <div className="grid gap-6">
      <PageHeader
        description="신고 내용과 처리 이력을 확인합니다."
        eyebrow={
          <Link
            className="admin-focus inline-flex items-center gap-1 rounded-sm font-medium text-brand hover:text-brand-hover"
            href="/reports"
          >
            <ArrowLeftIcon
              aria-hidden="true"
              focusable="false"
              size={16}
              weight="bold"
            />
            신고 목록
          </Link>
        }
        title="신고 상세"
      />

      <section aria-labelledby="report-summary-title" className="grid gap-3">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="report-summary-title"
        >
          신고 정보
        </h2>
        <DefinitionList items={summaryItems} />
      </section>

      <section aria-labelledby="report-evidence-title" className="grid gap-3">
        <div className="grid gap-1">
          <h2
            className="text-section font-semibold text-ink-strong"
            id="report-evidence-title"
          >
            증거 URL
          </h2>
          <p className="admin-keep-words text-body text-ink-subtle">
            HTTPS 주소만 새 탭으로 열 수 있으며 외부 콘텐츠는 화면에 삽입하지
            않습니다.
          </p>
        </div>
        <EvidenceUrlList urls={report.evidenceUrls} />
      </section>

      <section aria-labelledby="report-history-title" className="grid gap-3">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="report-history-title"
        >
          처리 이력
        </h2>
        <DefinitionList items={resolutionItems} />
      </section>

      <ResolutionForm currentStatus={report.status} reportId={report.id} />
    </div>
  );
}
