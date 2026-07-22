import Link from "next/link";
import type { ReactNode } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DefinitionList } from "@/components/ui/definition-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { TableShell, type AdminTableColumn, type AdminTableRow } from "@/components/ui/table-shell";
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_VARIANTS,
  PAYMENT_TYPE_LABELS,
} from "@/features/payments/labels";
import {
  formatDateTime,
  formatKrw,
  formatNullableText,
} from "@/features/payments/format";
import type { Payment } from "@/features/payments/schema";

const PAYMENT_COLUMNS = [
  { key: "id", kind: "identifier", label: "결제 ID" },
  { key: "reservationId", kind: "identifier", label: "예약 ID" },
  { key: "type", label: "결제 유형" },
  { key: "status", label: "상태" },
  { key: "amount", kind: "actions", label: "금액" },
  { key: "provider", label: "결제 제공자" },
  { key: "paidAt", label: "결제 일시" },
  { key: "createdAt", label: "생성 일시" },
] as const satisfies readonly AdminTableColumn[];

function Identifier({ children }: { readonly children: string }): ReactNode {
  return (
    <span className="inline-block min-w-max whitespace-nowrap font-mono tabular-nums text-compact">
      {children}
    </span>
  );
}

function paymentRows(payments: readonly Payment[]): readonly AdminTableRow[] {
  return payments.map((payment) => ({
    cells: [
      <Link
        className="admin-focus admin-interactive inline-block min-w-max whitespace-nowrap font-mono text-compact font-semibold text-brand-soft-ink underline decoration-brand/30 underline-offset-4 hover:text-brand"
        href={`/payments/${payment.id}`}
        key="id"
      >
        {payment.id}
      </Link>,
      <Identifier key="reservationId">{payment.reservationId}</Identifier>,
      <span className="admin-keep-words" key="type">
        {PAYMENT_TYPE_LABELS[payment.paymentType]}
      </span>,
      <Badge
        className="whitespace-nowrap"
        key="status"
        variant={PAYMENT_STATUS_VARIANTS[payment.paymentStatus]}
      >
        {PAYMENT_STATUS_LABELS[payment.paymentStatus]}
      </Badge>,
      <span className="whitespace-nowrap font-mono tabular-nums" key="amount">
        {formatKrw(payment.amountKrw)}
      </span>,
      <span className="admin-break-anywhere" key="provider">
        {formatNullableText(payment.pgProvider)}
      </span>,
      <span className="whitespace-nowrap" key="paidAt">
        {formatDateTime(payment.paidAt)}
      </span>,
      <span className="whitespace-nowrap" key="createdAt">
        {formatDateTime(payment.createdAt)}
      </span>,
    ],
    key: payment.id,
  }));
}

export function PaymentListView({
  payments,
}: {
  readonly payments: readonly Payment[];
}) {
  const rows = paymentRows(payments);

  return (
    <section className="grid gap-6">
      <PageHeader
        description="결제 상태와 금액을 확인하고 결제 원장 상세를 조회합니다."
        eyebrow="Payments"
        title="결제 조회"
      />
      <Alert title="조회 범위" variant="info">
        API가 반환하는 최근 생성 순 최대 50건을 표시합니다. 이 화면에서는 페이지 이동이나 결제 변경을 제공하지 않습니다.
      </Alert>
      {rows.length === 0 ? (
        <EmptyState
          description="아직 조회할 결제 내역이 없습니다."
          title="결제 내역이 없습니다"
        />
      ) : (
        <TableShell
          caption="결제 목록"
          columns={PAYMENT_COLUMNS}
          rows={rows}
        />
      )}
    </section>
  );
}

function DetailIdentifier({ value }: { readonly value: string }): ReactNode {
  return (
    <span className="font-mono text-compact tabular-nums">{value}</span>
  );
}

export function PaymentDetailView({ payment }: { readonly payment: Payment }) {
  const detailItems = [
    { label: "결제 ID", value: <DetailIdentifier value={payment.id} /> },
    {
      label: "예약 ID",
      value: <DetailIdentifier value={payment.reservationId} />,
    },
    {
      label: "학생 ID",
      value: <DetailIdentifier value={payment.studentId} />,
    },
    { label: "호스트 ID", value: <DetailIdentifier value={payment.hostId} /> },
    {
      label: "결제 유형",
      value: PAYMENT_TYPE_LABELS[payment.paymentType],
    },
    {
      label: "상태",
      value: (
        <Badge variant={PAYMENT_STATUS_VARIANTS[payment.paymentStatus]}>
          {PAYMENT_STATUS_LABELS[payment.paymentStatus]}
        </Badge>
      ),
    },
    {
      label: "금액",
      value: (
        <span className="font-mono font-semibold tabular-nums">
          {formatKrw(payment.amountKrw)}
        </span>
      ),
    },
    {
      label: "결제 제공자",
      value: formatNullableText(payment.pgProvider),
    },
    {
      label: "PG 거래 ID",
      value: (
        <span className="admin-break-anywhere font-mono text-compact">
          {formatNullableText(payment.pgTransactionId)}
        </span>
      ),
    },
    { label: "결제 일시", value: formatDateTime(payment.paidAt) },
    { label: "환불 일시", value: formatDateTime(payment.refundedAt) },
    { label: "생성 일시", value: formatDateTime(payment.createdAt) },
    { label: "수정 일시", value: formatDateTime(payment.updatedAt) },
  ] satisfies ReadonlyArray<{ readonly label: string; readonly value: ReactNode }>;

  return (
    <section className="grid gap-6">
      <PageHeader
        description="결제 API가 반환한 원장 필드만 표시합니다."
        eyebrow={
          <Link
            className="admin-focus admin-interactive text-brand-soft-ink underline decoration-brand/30 underline-offset-4 hover:text-brand"
            href="/payments"
          >
            Payments / 결제 목록
          </Link>
        }
        title="결제 상세"
      />
      <DefinitionList items={detailItems} />
    </section>
  );
}

export function PaymentErrorNotice() {
  return (
    <Alert title="결제 정보를 불러오지 못했습니다" variant="error">
      일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
    </Alert>
  );
}
