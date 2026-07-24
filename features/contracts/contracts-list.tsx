import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { Alert } from "@/components/ui/alert";
import { TableShell, type AdminTableRow } from "@/components/ui/table-shell";

import {
  ContractStatusBadge,
  formatContractDate,
  formatContractKrw,
} from "./contracts-format";
import type { Contract } from "./contracts-schema";

const CONTRACT_COLUMNS = [
  { key: "contract-id", label: "계약 ID", kind: "identifier" },
  { key: "reservation-id", label: "예약 ID", kind: "identifier" },
  { key: "room-id", label: "방 ID", kind: "identifier" },
  { key: "status", label: "상태" },
  { key: "period", label: "계약 기간" },
  { key: "deposit", label: "보증금" },
  { key: "monthly-rent", label: "월세" },
  { key: "maintenance", label: "관리비" },
  { key: "created-at", label: "생성일" },
] as const;

function ContractPeriod({ contract }: { readonly contract: Contract }) {
  return (
    <span className="grid gap-0.5 whitespace-nowrap">
      <span>{formatContractDate(contract.contractStartDate)}</span>
      <span className="text-label text-ink-subtle">
        ~ {formatContractDate(contract.contractEndDate)}
      </span>
    </span>
  );
}

function contractRows(contracts: readonly Contract[]): readonly AdminTableRow[] {
  return contracts.map((contract) => ({
    key: contract.id,
    cells: [
      <Link
        className="admin-focus admin-interactive inline-block min-w-36 font-mono font-semibold text-brand-soft-ink underline decoration-brand/40 underline-offset-2 hover:text-brand"
        href={`/contracts/${contract.id}`}
        key={`${contract.id}-link`}
      >
        {contract.id}
      </Link>,
      <span
        className="inline-block min-w-36 font-mono"
        key={`${contract.id}-reservation`}
      >
        {contract.reservationId}
      </span>,
      <span className="inline-block min-w-36 font-mono" key={`${contract.id}-room`}>
        {contract.roomId}
      </span>,
      <ContractStatusBadge key={`${contract.id}-status`} status={contract.contractStatus} />,
      <ContractPeriod contract={contract} key={`${contract.id}-period`} />,
      <span className="whitespace-nowrap tabular-nums" key={`${contract.id}-deposit`}>
        {formatContractKrw(contract.depositKrw)}
      </span>,
      <span className="whitespace-nowrap tabular-nums" key={`${contract.id}-rent`}>
        {formatContractKrw(contract.monthlyRentKrw)}
      </span>,
      <span
        className="whitespace-nowrap tabular-nums"
        key={`${contract.id}-maintenance`}
      >
        {formatContractKrw(contract.maintenanceFeeKrw)}
      </span>,
      <time dateTime={contract.createdAt} key={`${contract.id}-created`}>
        {formatContractDate(contract.createdAt)}
      </time>,
    ],
  }));
}

export function ContractsList({ contracts }: { readonly contracts: readonly Contract[] }) {
  return (
    <section className="grid gap-6">
      <PageHeader
        description="계약의 상태와 금액을 확인하고 상세 계약 정보를 열람합니다."
        eyebrow="운영 업무"
        title="Contracts"
      />
      <Alert title="최근 계약 50건" variant="info">
        계약 목록은 백엔드 정책에 따라 최근 생성된 50건만 제공합니다. 페이지를
        나누거나 추가 조회 조건을 만들지 않았습니다.
      </Alert>
      {contracts.length === 0 ? (
        <EmptyState
          description="현재 조회할 계약이 없습니다. 새 계약이 생성되면 이곳에서 확인할 수 있습니다."
          title="계약이 없습니다"
        />
      ) : (
        <TableShell
          caption="계약 목록"
          columns={CONTRACT_COLUMNS}
          rows={contractRows(contracts)}
        />
      )}
    </section>
  );
}
