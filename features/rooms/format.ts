export function displayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}
export function booleanLabel(value: boolean): string {
  return value ? "예" : "아니요";
}

export function formatDate(value: string | null): string {
  if (value === null) return "—";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export function formatKrw(value: number | null): string {
  if (value === null) return "—";
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

export function listLabel(values: readonly string[]): string {
  return values.length === 0 ? "—" : values.join(", ");
}
