import type { BadgeVariant } from "@/components/ui/badge";

import type {
  HostConsultationHousingType,
  HostConsultationRegionType,
  HostConsultationStatus,
} from "./constants";

export const HOST_CONSULTATION_REGION_OPTIONS = [
  { label: "전체 지역 유형", value: "" },
  { label: "대학교", value: "university" },
  { label: "지하철역", value: "subway" },
  { label: "대학교 직접 입력", value: "custom_university" },
  { label: "지하철역 직접 입력", value: "custom_subway" },
] as const;

export const HOST_CONSULTATION_HOUSING_OPTIONS = [
  { label: "전체 주택 형태", value: "" },
  { label: "자가", value: "owned" },
  { label: "전세·월세", value: "leased_or_rented" },
] as const;

export const HOST_CONSULTATION_STATUS_OPTIONS = [
  { label: "전체 상태", value: "" },
  { label: "접수 대기", value: "pending" },
  { label: "연락 완료", value: "contacted" },
  { label: "종료", value: "closed" },
] as const;

const REGION_TYPE_LABELS = {
  university: "대학교",
  subway: "지하철역",
  custom_university: "대학교 직접 입력",
  custom_subway: "지하철역 직접 입력",
} as const satisfies Record<HostConsultationRegionType, string>;

const HOUSING_TYPE_LABELS = {
  owned: "자가",
  leased_or_rented: "전세·월세",
} as const satisfies Record<HostConsultationHousingType, string>;

const STATUS_META = {
  pending: { label: "접수 대기", variant: "warning" },
  contacted: { label: "연락 완료", variant: "info" },
  closed: { label: "종료", variant: "neutral" },
} as const satisfies Record<
  HostConsultationStatus,
  { readonly label: string; readonly variant: BadgeVariant }
>;

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

export function hostConsultationRegionTypeLabel(
  type: HostConsultationRegionType,
): string {
  return REGION_TYPE_LABELS[type];
}

export function hostConsultationHousingTypeLabel(
  type: HostConsultationHousingType,
): string {
  return HOUSING_TYPE_LABELS[type];
}

export function hostConsultationStatusMeta(status: HostConsultationStatus) {
  return STATUS_META[status];
}

export function formatHostConsultationDateTime(value: string): string {
  return DATE_TIME_FORMATTER.format(new Date(value));
}
