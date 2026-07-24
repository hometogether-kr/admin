import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { DefinitionList } from "@/components/ui/definition-list";
import { EmptyState } from "@/components/ui/empty-state";
import { SupportActions } from "@/features/supports/support-actions";
import {
  formatSupportDateTime,
  safeHttpsEvidenceUrl,
  supportInquiryTypeLabel,
  supportStatusMeta,
} from "@/features/supports/presentation";
import type { Support } from "@/features/supports/schema";
import type { AdminActionResult } from "@/lib/actions/result";

type SupportMutationAction = (
  previousResult: AdminActionResult,
  formData: FormData,
) => Promise<AdminActionResult>;

type SupportDetailProps = {
  readonly dismissAction: SupportMutationAction;
  readonly resolveAction: SupportMutationAction;
  readonly support: Support;
};

function Identifier({ children }: { readonly children: string }) {
  return <span className="font-mono tabular-nums">{children}</span>;
}

export function SupportDetail({
  dismissAction,
  resolveAction,
  support,
}: SupportDetailProps) {
  const status = supportStatusMeta(support.status);
  const evidence = support.evidenceUrls.map(safeHttpsEvidenceUrl);

  return (
    <div className="grid gap-8">
      <DefinitionList
        items={[
          { label: "문의 ID", value: <Identifier>{support.id}</Identifier> },
          {
            label: "사용자 ID",
            value:
              support.userId === null ? (
                "익명 문의"
              ) : (
                <Identifier>{support.userId}</Identifier>
              ),
          },
          {
            label: "문의 유형",
            value: supportInquiryTypeLabel(support.inquiryType),
          },
          {
            label: "처리 상태",
            value: (
              <Badge variant={status.variant}>
                <span className="whitespace-nowrap">{status.label}</span>
              </Badge>
            ),
          },
        ]}
      />

      <section aria-labelledby="support-body-title" className="grid gap-3">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="support-body-title"
        >
          문의 내용
        </h2>
        <p className="admin-break-anywhere whitespace-pre-wrap rounded-panel border border-line-subtle bg-surface p-4 text-body text-ink-strong">
          {support.body}
        </p>
      </section>

      <section aria-labelledby="support-evidence-title" className="grid gap-3">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="support-evidence-title"
        >
          증빙 자료
        </h2>
        {evidence.length === 0 ? (
          <EmptyState
            description="이 문의에는 등록된 증빙 주소가 없습니다."
            title="증빙 자료가 없습니다"
          />
        ) : (
          <ul className="grid list-none gap-2 p-0">
            {evidence.map((safeUrl, index) => (
              <li
                className="admin-break-anywhere rounded-panel border border-line-subtle bg-surface p-3 text-body"
                key={`${index}-${safeUrl ?? "unsafe"}`}
              >
                {safeUrl === null ? (
                  <span className="text-ink-subtle">
                    안전한 HTTPS 주소가 아니므로 링크를 열 수 없습니다.
                  </span>
                ) : (
                  <a
                    className="admin-focus text-brand underline underline-offset-4 hover:text-brand-hover"
                    href={safeUrl}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    {safeUrl}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="support-resolution-title" className="grid gap-3">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="support-resolution-title"
        >
          처리 기록
        </h2>
        <DefinitionList
          items={[
            { label: "처리 내용", value: support.resolution ?? "아직 기록되지 않았습니다." },
            { label: "관리자 메모", value: support.adminNote ?? "없음" },
            {
              label: "처리 관리자 ID",
              value:
                support.resolvedBy === null ? (
                  "없음"
                ) : (
                  <Identifier>{support.resolvedBy}</Identifier>
                ),
            },
            {
              label: "처리 시각",
              value: formatSupportDateTime(support.resolvedAt),
            },
          ]}
        />
      </section>

      <section aria-labelledby="support-timestamps-title" className="grid gap-3">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="support-timestamps-title"
        >
          기록 시각
        </h2>
        <DefinitionList
          items={[
            { label: "접수", value: formatSupportDateTime(support.createdAt) },
            { label: "최근 수정", value: formatSupportDateTime(support.updatedAt) },
            { label: "삭제", value: formatSupportDateTime(support.deletedAt) },
          ]}
        />
      </section>

      <SupportActions
        dismissAction={dismissAction}
        resolveAction={resolveAction}
        status={support.status}
      />

      <Link
        className="admin-focus admin-interactive admin-control justify-self-start rounded-control border border-line bg-surface px-4 py-2 text-body font-semibold text-ink-strong hover:border-line-strong hover:bg-surface-subtle"
        href="/supports"
      >
        문의 목록으로 돌아가기
      </Link>
    </div>
  );
}
