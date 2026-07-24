import type { BadgeVariant } from "@/components/ui/badge";

export const REPORT_STATUSES = [
  "pending",
  "investigating",
  "resolved",
  "dismissed",
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_RESOLUTION_STATUSES = [
  "resolved",
  "dismissed",
  "investigating",
] as const;

export type ReportResolutionStatus =
  (typeof REPORT_RESOLUTION_STATUSES)[number];

export const REPORT_TARGET_TYPES = ["user", "room", "reservation"] as const;

export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const REPORT_STATUS_LABELS = {
  pending: "접수됨",
  investigating: "조사 중",
  resolved: "해결됨",
  dismissed: "기각됨",
} as const satisfies Record<ReportStatus, string>;

export const REPORT_STATUS_BADGE_VARIANTS = {
  pending: "warning",
  investigating: "info",
  resolved: "success",
  dismissed: "neutral",
} as const satisfies Record<ReportStatus, BadgeVariant>;

export const REPORT_TARGET_TYPE_LABELS = {
  user: "사용자",
  room: "매물",
  reservation: "예약",
} as const satisfies Record<ReportTargetType, string>;

export function parseReportResolutionStatus(
  value: string,
): ReportResolutionStatus | null {
  return REPORT_RESOLUTION_STATUSES.find((status) => status === value) ?? null;
}
