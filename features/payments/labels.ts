import type { BadgeVariant } from "@/components/ui/badge";

import type { PaymentStatus, PaymentType } from "@/features/payments/schema";

export const PAYMENT_TYPE_LABELS = {
  reservationFee: "예약금",
  contractFee: "계약금",
  serviceFee: "서비스 이용료",
  careFee: "케어비",
  deposit: "보증금",
  rent: "월세",
  maintenanceFee: "관리비",
  cleaningFee: "청소비",
} as const satisfies Record<PaymentType, string>;

export const PAYMENT_STATUS_LABELS = {
  pending: "결제 대기",
  requested: "결제 요청",
  completed: "결제 완료",
  failed: "결제 실패",
  cancelled: "결제 취소",
  refundRequested: "환불 요청",
  refundCompleted: "환불 완료",
} as const satisfies Record<PaymentStatus, string>;

export const PAYMENT_STATUS_VARIANTS = {
  pending: "neutral",
  requested: "info",
  completed: "success",
  failed: "error",
  cancelled: "neutral",
  refundRequested: "warning",
  refundCompleted: "success",
} as const satisfies Record<PaymentStatus, BadgeVariant>;
