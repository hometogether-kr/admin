import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TableShell } from "@/components/ui/table-shell";
import type { AdminTableColumn } from "@/components/ui/table-shell";
import type { Sanction } from "@/features/users/contracts";
import { formatUserDateTime } from "@/features/users/formatters";
import { SANCTION_TYPE_LABELS } from "@/features/users/labels";

type SanctionHistoryProps = {
  readonly sanctions: readonly Sanction[];
};

const SANCTION_COLUMNS = [
  { key: "type", label: "유형" },
  { key: "reason", label: "사유" },
  { key: "expires", label: "만료" },
  { key: "report", kind: "identifier", label: "신고 ID" },
  { key: "applied", label: "적용 일시" },
] as const satisfies readonly AdminTableColumn[];

export function SanctionHistory({ sanctions }: SanctionHistoryProps) {
  return (
    <section
      aria-labelledby="sanction-history-title"
      className="relative grid gap-4"
    >
      <div className="grid gap-1">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="sanction-history-title"
        >
          제재 이력
        </h2>
        <p className="admin-keep-words text-body text-ink-subtle">
          최고 관리자에게만 제공되는 적용 이력입니다.
        </p>
      </div>
      {sanctions.length === 0 ? (
        <EmptyState
          description="이 사용자에게 적용된 제재가 없습니다."
          title="제재 이력이 없습니다"
        />
      ) : (
        <TableShell
          caption="사용자 제재 이력"
          columns={SANCTION_COLUMNS}
          rows={sanctions.map((sanction) => ({
            key: sanction.id,
            cells: [
              <Badge className="whitespace-nowrap" key="type" variant="warning">
                {SANCTION_TYPE_LABELS[sanction.sanctionType]}
              </Badge>,
              <span className="admin-break-anywhere" key="reason">
                {sanction.reason}
              </span>,
              sanction.expiresAt === null ? (
                <span key="expires">영구</span>
              ) : (
                <time dateTime={sanction.expiresAt} key="expires">
                  {formatUserDateTime(sanction.expiresAt)}
                </time>
              ),
              <span className="admin-break-anywhere font-mono text-compact" key="report">
                {sanction.reportId ?? "없음"}
              </span>,
              <time dateTime={sanction.createdAt} key="applied">
                {formatUserDateTime(sanction.createdAt)}
              </time>,
            ],
          }))}
        />
      )}
    </section>
  );
}
