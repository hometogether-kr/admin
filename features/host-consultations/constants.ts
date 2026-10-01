export const HOST_CONSULTATION_REGION_TYPES = [
  "university",
  "subway",
  "custom_university",
  "custom_subway",
] as const;

export const HOST_CONSULTATION_HOUSING_TYPES = [
  "owned",
  "leased_or_rented",
] as const;

export const HOST_CONSULTATION_STATUSES = [
  "pending",
  "contacted",
  "closed",
] as const;

export type HostConsultationRegionType =
  (typeof HOST_CONSULTATION_REGION_TYPES)[number];
export type HostConsultationHousingType =
  (typeof HOST_CONSULTATION_HOUSING_TYPES)[number];
export type HostConsultationStatus =
  (typeof HOST_CONSULTATION_STATUSES)[number];
