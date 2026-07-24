import type { BadgeVariant } from "@/components/ui/badge";

export const RESERVATION_STATUSES = [
  "requested",
  "hostViewed",
  "accepted",
  "rejected",
  "visitScheduled",
  "visitCompleted",
  "contractPending",
  "contractSent",
  "contractSigned",
  "paymentPending",
  "paymentCompleted",
  "cancelledByStudent",
  "cancelledByHost",
  "expired",
  "completed",
  "checkoutPending",
  "checkoutCompleted",
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const RESERVATION_STATUS_LABELS = {
  requested: "요청됨",
  hostViewed: "호스트 확인",
  accepted: "수락됨",
  rejected: "거절됨",
  visitScheduled: "방문 예정",
  visitCompleted: "방문 완료",
  contractPending: "계약 대기",
  contractSent: "계약 발송",
  contractSigned: "계약 서명",
  paymentPending: "결제 대기",
  paymentCompleted: "결제 완료",
  cancelledByStudent: "학생 취소",
  cancelledByHost: "호스트 취소",
  expired: "만료됨",
  completed: "완료됨",
  checkoutPending: "체크아웃 대기",
  checkoutCompleted: "체크아웃 완료",
} as const satisfies Record<ReservationStatus, string>;

export const RESERVATION_STATUS_VARIANTS = {
  requested: "accent",
  hostViewed: "info",
  accepted: "success",
  rejected: "error",
  visitScheduled: "accent",
  visitCompleted: "success",
  contractPending: "warning",
  contractSent: "info",
  contractSigned: "success",
  paymentPending: "warning",
  paymentCompleted: "success",
  cancelledByStudent: "error",
  cancelledByHost: "error",
  expired: "neutral",
  completed: "success",
  checkoutPending: "warning",
  checkoutCompleted: "success",
} as const satisfies Record<ReservationStatus, BadgeVariant>;

export const TERMINAL_RESERVATION_STATUSES = [
  "rejected",
  "cancelledByStudent",
  "cancelledByHost",
  "expired",
] as const satisfies readonly ReservationStatus[];

export function isTerminalReservationStatus(
  status: ReservationStatus,
): boolean {
  return TERMINAL_RESERVATION_STATUSES.some((terminal) => terminal === status);
}

export const NOTIFICATION_TEMPLATES = [
  "reservationRequested",
  "reservationAccepted",
  "reservationRejected",
  "roomApproved",
  "roomRevisionRequested",
  "roomRejected",
  "visitReminder",
  "contractIntentRequest",
  "contractIntentReceived",
  "paymentCompleted",
  "checkinReminder",
  "checkoutReminder",
  "payoutScheduled",
] as const;

export type NotificationTemplate = (typeof NOTIFICATION_TEMPLATES)[number];

export const NOTIFICATION_TEMPLATE_LABELS = {
  reservationRequested: "예약 요청",
  reservationAccepted: "예약 수락",
  reservationRejected: "예약 거절",
  roomApproved: "방 승인",
  roomRevisionRequested: "방 수정 요청",
  roomRejected: "방 거절",
  visitReminder: "방문 알림",
  contractIntentRequest: "계약 의사 요청",
  contractIntentReceived: "계약 의사 수신",
  paymentCompleted: "결제 완료",
  checkinReminder: "체크인 알림",
  checkoutReminder: "체크아웃 알림",
  payoutScheduled: "정산 예정",
} as const satisfies Record<NotificationTemplate, string>;

export const RESERVATION_REJECT_REASONS = {
  alreadyInProgress: "이미 진행 중인 예약",
  moveInDateMismatch: "입주일 불일치",
  stayPeriodMismatch: "거주 기간 불일치",
  conditionMismatch: "조건 불일치",
  other: "기타",
} as const satisfies Record<string, string>;

export const CONTRACT_INTENT_LABELS = {
  wantContract: "계약 희망",
  considering: "검토 중",
  declined: "계약하지 않음",
} as const satisfies Record<string, string>;

export function formatReservationDate(value: string | null | undefined): string {
  if (value === null || value === undefined) return "없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "확인 필요";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeZone: "Asia/Seoul",
  }).format(date);
}

export function formatReservationDateTime(
  value: string | null | undefined,
): string {
  if (value === null || value === undefined) return "없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "확인 필요";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(date);
}

export function formatReservationStay(months: number | null | undefined): string {
  return months === null || months === undefined ? "없음" : `${months}개월`;
}
