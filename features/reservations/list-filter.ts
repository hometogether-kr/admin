import type { ReservationStatus } from "@/features/reservations/constants";

export type ReservationListQuery = {
  readonly status: ReservationStatus | undefined;
};

export function reservationListHref(
  status: ReservationStatus | undefined,
): string {
  if (status === undefined) return "/reservations";
  const search = new URLSearchParams({ status });
  return `/reservations?${search.toString()}`;
}
