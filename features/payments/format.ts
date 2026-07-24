const KRW_FORMATTER = new Intl.NumberFormat("ko-KR", {
  currency: "KRW",
  maximumFractionDigits: 0,
  style: "currency",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

export function formatKrw(amountKrw: number): string {
  return KRW_FORMATTER.format(amountKrw);
}

export function formatDateTime(value: string | null): string {
  if (value === null) return "없음";
  return DATE_TIME_FORMATTER.format(new Date(value));
}

export function formatNullableText(value: string | null): string {
  const normalized = value?.trim();
  return normalized === undefined || normalized.length === 0
    ? "없음"
    : normalized;
}

export function formatPaymentProvider(value: string | null): string {
  switch (value?.trim()) {
    case undefined:
    case "":
      return "없음";
    case "stub":
      return "테스트 결제 제공자";
    case "toss":
      return "토스페이먼츠";
    default:
      return "알 수 없는 결제 제공자";
  }
}
