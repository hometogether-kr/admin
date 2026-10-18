const formatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

export function formatGuestRegionDateTime(value: string): string {
  return formatter.format(new Date(value));
}
