import type { BadgeVariant } from "@/components/ui/badge";
import type { SanctionType, UserRole } from "@/features/users/contracts";

export const USER_ROLE_LABELS = {
  student: "학생",
  host: "호스트",
  admin: "관리자",
  superAdmin: "최고 관리자",
  roomManager: "방 관리자",
  reservationManager: "예약 관리자",
  paymentManager: "결제 관리자",
  csManager: "고객 지원 관리자",
} as const satisfies Record<UserRole, string>;

export const USER_ROLE_BADGE_VARIANTS = {
  student: "accent",
  host: "info",
  admin: "neutral",
  superAdmin: "warning",
  roomManager: "neutral",
  reservationManager: "neutral",
  paymentManager: "neutral",
  csManager: "neutral",
} as const satisfies Record<UserRole, BadgeVariant>;

export const SANCTION_TYPE_LABELS = {
  warning: "경고",
  suspend: "일시 정지",
  ban: "영구 정지",
  payoutHold: "정산 보류",
} as const satisfies Record<SanctionType, string>;
