import { ArrowSquareOutIcon } from "@phosphor-icons/react/ssr";

import { Badge } from "@/components/ui/badge";
import {
  REPORT_STATUS_BADGE_VARIANTS,
  REPORT_STATUS_LABELS,
  type ReportStatus,
} from "@/features/reports/constants";
import {
  formatEvidenceUrlForDisplay,
  parseHttpsEvidenceUrl,
} from "@/features/reports/schemas";

const REPORT_DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

export function formatReportTimestamp(value: string): string {
  return REPORT_DATE_FORMATTER.format(new Date(value));
}

export function ReportStatusBadge({ status }: { readonly status: ReportStatus }) {
  return (
    <Badge
      className="whitespace-nowrap"
      variant={REPORT_STATUS_BADGE_VARIANTS[status]}
    >
      {REPORT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function EvidenceUrlList({ urls }: { readonly urls: readonly string[] }) {
  if (urls.length === 0) {
    return <p className="text-body text-ink-subtle">등록된 증거 URL이 없습니다.</p>;
  }

  return (
    <ul className="grid list-none gap-2 p-0">
      {urls.map((value, index) => {
        const href = parseHttpsEvidenceUrl(value);
        const displayValue = formatEvidenceUrlForDisplay(value);
        return (
          <li
            className="min-w-0 rounded-control border border-line-subtle bg-surface-subtle p-3"
            key={`${index}-${value}`}
          >
            {href === null ? (
              <span
                className="grid min-w-0 gap-1 text-body text-ink-subtle"
                data-evidence-link="unsafe"
              >
                <span className="admin-break-anywhere">{displayValue}</span>
                <span className="admin-keep-words">링크로 연결되지 않음</span>
              </span>
            ) : (
              <a
                className="admin-focus admin-break-anywhere inline-flex max-w-full items-start gap-2 rounded-sm text-body font-medium text-brand hover:text-brand-hover"
                data-evidence-link="safe"
                href={href}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span>{value}</span>
                <ArrowSquareOutIcon
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                  focusable="false"
                  size={16}
                  weight="bold"
                />
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
