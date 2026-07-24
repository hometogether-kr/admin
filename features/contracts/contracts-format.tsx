import { Badge, type BadgeVariant } from "@/components/ui/badge";

import type { ContractStatus } from "./contracts-schema";

export const CONTRACT_STATUS_LABELS = {
  draft: "초안",
  sent: "서명 요청",
  studentSigned: "학생 서명 완료",
  hostSigned: "호스트 서명 완료",
  completed: "계약 완료",
  cancelled: "취소됨",
} as const satisfies Record<ContractStatus, string>;

const CONTRACT_STATUS_VARIANTS = {
  draft: "neutral",
  sent: "info",
  studentSigned: "accent",
  hostSigned: "accent",
  completed: "success",
  cancelled: "error",
} as const satisfies Record<ContractStatus, BadgeVariant>;

const KRW_FORMATTER = new Intl.NumberFormat("ko-KR", {
  currency: "KRW",
  maximumFractionDigits: 0,
  style: "currency",
});

const DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatContractKrw(value: number): string {
  return KRW_FORMATTER.format(value);
}

export function formatContractDate(value: string | null): string {
  if (value === null) return "없음";
  return DATE_FORMATTER.format(new Date(value));
}

export function formatContractDateTime(value: string | null): string {
  if (value === null) return "없음";
  return DATETIME_FORMATTER.format(new Date(value));
}

export function contractStatusLabel(status: ContractStatus): string {
  return CONTRACT_STATUS_LABELS[status];
}

export function ContractStatusBadge({ status }: { readonly status: ContractStatus }) {
  return (
    <Badge className="whitespace-nowrap" variant={CONTRACT_STATUS_VARIANTS[status]}>
      {contractStatusLabel(status)}
    </Badge>
  );
}

export function parseSafeContractFileUrl(value: string | null): URL | null {
  if (value === null) return null;

  try {
    const parsed = new URL(value);
    if (
      parsed.protocol !== "https:" ||
      parsed.username.length > 0 ||
      parsed.password.length > 0
    ) {
      return null;
    }
    return parsed;
  } catch (error) {
    if (error instanceof TypeError) return null;
    throw error;
  }
}
