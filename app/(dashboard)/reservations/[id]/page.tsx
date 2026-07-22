import { notFound } from "next/navigation";

import { findReservation } from "@/features/reservations/queries";
import { ReservationDetail } from "@/features/reservations/reservation-detail";

type ReservationDetailPageProps = {
  readonly params: Promise<{ readonly id: string }>;
};

export default async function ReservationDetailPage({
  params,
}: ReservationDetailPageProps) {
  const { id } = await params;
  const reservation = await findReservation(id, `/reservations/${id}`);
  if (reservation === null) notFound();

  return <ReservationDetail reservation={reservation} />;
}
