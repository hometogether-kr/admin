import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { DefinitionList, type DefinitionItem } from "@/components/ui/definition-list";

import {
  ContractStatusBadge,
  formatContractDate,
  formatContractDateTime,
  formatContractKrw,
  parseSafeContractFileUrl,
} from "./contracts-format";
import type { Contract } from "./contracts-schema";

function Identifier({ value }: { readonly value: string }) {
  return <span className="font-mono text-compact">{value}</span>;
}

function Utilities({ values }: { readonly values: readonly string[] | null }) {
  if (values === null || values.length === 0) return <span>없음</span>;

  return (
    <ul className="m-0 grid list-disc gap-1 pl-5">
      {values.map((value) => (
        <li className="admin-break-anywhere" key={value}>
          {value}
        </li>
      ))}
    </ul>
  );
}

function ContractFile({ value }: { readonly value: string | null }) {
  const safeUrl = parseSafeContractFileUrl(value);
  if (safeUrl === null) {
    return <span>안전한 HTTPS 파일 주소가 없어 열 수 없습니다.</span>;
  }

  return (
    <Link
      className="admin-focus admin-interactive inline-flex min-h-control items-center rounded-control border border-line bg-surface px-3 text-body font-semibold text-brand-soft-ink underline decoration-brand/40 underline-offset-2 hover:border-line-strong hover:bg-surface-subtle hover:text-brand"
      href={safeUrl.toString()}
      rel="noreferrer noopener"
      target="_blank"
    >
      계약 파일 열기
    </Link>
  );
}

function identityItems(contract: Contract): readonly DefinitionItem[] {
  return [
    { label: "계약 ID", value: <Identifier value={contract.id} /> },
    { label: "예약 ID", value: <Identifier value={contract.reservationId} /> },
    { label: "방 ID", value: <Identifier value={contract.roomId} /> },
    { label: "학생 ID", value: <Identifier value={contract.studentId} /> },
    { label: "호스트 ID", value: <Identifier value={contract.hostId} /> },
    {
      label: "상태",
      value: <ContractStatusBadge status={contract.contractStatus} />,
    },
  ];
}

function financialItems(contract: Contract): readonly DefinitionItem[] {
  return [
    { label: "계약 시작일", value: formatContractDate(contract.contractStartDate) },
    { label: "계약 종료일", value: formatContractDate(contract.contractEndDate) },
    { label: "보증금", value: formatContractKrw(contract.depositKrw) },
    { label: "월세", value: formatContractKrw(contract.monthlyRentKrw) },
    { label: "관리비", value: formatContractKrw(contract.maintenanceFeeKrw) },
    { label: "포함 공과금", value: <Utilities values={contract.includedUtilities} /> },
    {
      label: "특약",
      value: contract.specialTerms === null ? "없음" : (
        <p className="m-0 whitespace-pre-wrap">{contract.specialTerms}</p>
      ),
    },
    { label: "계약 파일", value: <ContractFile value={contract.contractFileUrl} /> },
  ];
}

function timelineItems(contract: Contract): readonly DefinitionItem[] {
  return [
    { label: "학생 서명 시각", value: formatContractDateTime(contract.studentSignedAt) },
    { label: "호스트 서명 시각", value: formatContractDateTime(contract.hostSignedAt) },
    { label: "입주 시각", value: formatContractDateTime(contract.moveInDate) },
    {
      label: "체크인 알림 시각",
      value: formatContractDateTime(contract.checkinReminderSentAt),
    },
    { label: "생성 시각", value: formatContractDateTime(contract.createdAt) },
    { label: "수정 시각", value: formatContractDateTime(contract.updatedAt) },
    { label: "삭제 시각", value: formatContractDateTime(contract.deletedAt) },
  ];
}

export function ContractDetail({ contract }: { readonly contract: Contract }) {
  return (
    <section className="grid gap-6">
      <PageHeader
        actions={
          <Link
            className="admin-focus admin-interactive admin-control inline-flex items-center justify-center rounded-control border border-line bg-surface px-4 text-body font-semibold text-ink-strong hover:border-line-strong hover:bg-surface-subtle"
            href="/contracts"
          >
            계약 목록
          </Link>
        }
        description="서명, 입주 일정과 금액을 포함한 계약 원문 필드를 안전하게 열람합니다."
        eyebrow="계약 상세"
        title="Contract detail"
      />
      <section className="grid gap-3" aria-labelledby="contract-identities">
        <h2 className="text-section font-semibold text-ink-strong" id="contract-identities">
          기본 정보
        </h2>
        <DefinitionList items={identityItems(contract)} />
      </section>
      <section className="grid gap-3" aria-labelledby="contract-financials">
        <h2 className="text-section font-semibold text-ink-strong" id="contract-financials">
          계약 조건
        </h2>
        <DefinitionList items={financialItems(contract)} />
      </section>
      <section className="grid gap-3" aria-labelledby="contract-timeline">
        <h2 className="text-section font-semibold text-ink-strong" id="contract-timeline">
          일정과 변경 이력
        </h2>
        <DefinitionList items={timelineItems(contract)} />
      </section>
    </section>
  );
}
