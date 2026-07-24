import type { BadgeVariant } from "@/components/ui/badge";
import type {
  SupportInquiryType,
  SupportStatus,
} from "@/features/supports/schema";

export const SUPPORT_STATUS_OPTIONS = [
  { label: "전체 상태", value: "" },
  { label: "대기", value: "pending" },
  { label: "조사 중", value: "investigating" },
  { label: "해결", value: "resolved" },
  { label: "기각", value: "dismissed" },
] as const;

export const SUPPORT_INQUIRY_TYPE_OPTIONS = [
  { label: "전체 문의 유형", value: "" },
  { label: "직접 거래", value: "directTrade" },
  { label: "결제", value: "payment" },
  { label: "계약", value: "contract" },
  { label: "매물", value: "room" },
  { label: "기타", value: "other" },
] as const;

const STATUS_META = {
  pending: { label: "대기", variant: "warning" },
  investigating: { label: "조사 중", variant: "info" },
  resolved: { label: "해결", variant: "success" },
  dismissed: { label: "기각", variant: "error" },
} as const satisfies Record<
  SupportStatus,
  { readonly label: string; readonly variant: BadgeVariant }
>;

const INQUIRY_TYPE_LABELS = {
  directTrade: "직접 거래",
  payment: "결제",
  contract: "계약",
  room: "매물",
  other: "기타",
} as const satisfies Record<SupportInquiryType, string>;

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

export function supportStatusMeta(status: SupportStatus) {
  return STATUS_META[status];
}

export function supportInquiryTypeLabel(type: SupportInquiryType): string {
  return INQUIRY_TYPE_LABELS[type];
}

export function formatSupportDateTime(value: string | null): string {
  return value === null ? "없음" : DATE_TIME_FORMATTER.format(new Date(value));
}

export function safeHttpsEvidenceUrl(value: string): string | null {
  if (!URL.canParse(value)) return null;
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.username.length > 0 ||
    url.password.length > 0
  ) {
    return null;
  }
  return url.toString();
}
