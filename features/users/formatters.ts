const DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeZone: "Asia/Seoul",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

export function formatUserDate(value: string): string {
  return DATE_FORMATTER.format(new Date(value));
}

export function formatUserDateTime(value: string): string {
  return DATE_TIME_FORMATTER.format(new Date(value));
}

export function displayOptionalText(value: string | null): string {
  return value?.trim() || "미입력";
}
