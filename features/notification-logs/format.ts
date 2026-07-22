import type {
  NotificationChannel,
  NotificationSendStatus,
} from "./schemas";

export const CHANNEL_LABELS = {
  alimtalk: "알림톡",
  sms: "문자",
  email: "이메일",
  kakaoChannel: "카카오 채널",
} as const satisfies Record<NotificationChannel, string>;

export const SEND_STATUS_LABELS = {
  pending: "대기 중",
  sent: "전송 완료",
  failed: "전송 실패",
} as const satisfies Record<NotificationSendStatus, string>;

export const SEND_STATUS_CLASSES = {
  pending: "warning",
  sent: "success",
  failed: "error",
} as const satisfies Record<NotificationSendStatus, "warning" | "success" | "error">;

const DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

const NUMBER_FORMATTER = new Intl.NumberFormat("ko-KR");

const SENSITIVE_MESSAGE_KEY_PATTERN =
  /(?:authorization|cookie|password|passwd|secret|accesstoken|refreshtoken|apikey|privatekey|token|credential)/u;

function compactNotificationText(value: string): string {
  return value.replace(/\s+/gu, " ").trim();
}

export function formatNotificationDate(value: string | null): string {
  if (value === null) return "없음";
  return DATE_FORMATTER.format(new Date(value));
}

export function formatNotificationNumber(value: number): string {
  return NUMBER_FORMATTER.format(value);
}

export function truncateNotificationText(value: string, maxLength: number): string {
  const compact = compactNotificationText(value);
  const characters = Array.from(compact);
  if (characters.length <= maxLength) return compact;
  return `${characters.slice(0, Math.max(1, maxLength - 1)).join("")}…`;
}

export function isNotificationTextTruncated(
  value: string,
  maxLength: number,
): boolean {
  return Array.from(compactNotificationText(value)).length > maxLength;
}

export function redactNotificationMessageValue(
  key: string,
  value: string,
): string {
  // Expanding an operational record must not reveal credential-like fields.
  const normalizedKey = key.replace(/[^a-z0-9]/giu, "").toLowerCase();
  return SENSITIVE_MESSAGE_KEY_PATTERN.test(normalizedKey)
    ? "민감 정보 가림"
    : value;
}

export function buildNotificationPageHref(page: number, limit: number): string {
  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });
  return `/notification-logs?${params.toString()}`;
}
