import type { BadgeVariant } from "@/components/ui/badge";

export const ROOM_STATUSES = [
  "draft",
  "submitted",
  "inReview",
  "revisionRequested",
  "approved",
  "published",
  "reservationRequested",
  "contractInProgress",
  "contractCompleted",
  "hidden",
  "rejected",
] as const;

export type RoomStatus = (typeof ROOM_STATUSES)[number];

export const ROOM_STATUS_LABELS = {
  draft: "작성 중",
  submitted: "제출됨",
  inReview: "검토 중",
  revisionRequested: "수정 요청",
  approved: "승인됨",
  published: "게시됨",
  reservationRequested: "예약 요청",
  contractInProgress: "계약 진행",
  contractCompleted: "계약 완료",
  hidden: "숨김",
  rejected: "반려됨",
} as const satisfies Record<RoomStatus, string>;

export const ROOM_STATUS_BADGE = {
  draft: "neutral",
  submitted: "info",
  inReview: "warning",
  revisionRequested: "warning",
  approved: "success",
  published: "accent",
  reservationRequested: "info",
  contractInProgress: "info",
  contractCompleted: "success",
  hidden: "neutral",
  rejected: "error",
} as const satisfies Record<RoomStatus, BadgeVariant>;

export const ROOM_NOTIFICATION_TEMPLATES = [
  "roomApproved",
  "roomRejected",
  "roomRevisionRequested",
] as const;

export const ROOM_NOTIFICATION_LABELS = {
  roomApproved: "방 승인 알림",
  roomRejected: "방 반려 알림",
  roomRevisionRequested: "방 수정 요청 알림",
} as const satisfies Record<(typeof ROOM_NOTIFICATION_TEMPLATES)[number], string>;
