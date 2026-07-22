import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { TableShell, type AdminTableRow } from "@/components/ui/table-shell";

import {
  formatReservationDate,
  formatReservationStay,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_VARIANTS,
} from "@/features/reservations/constants";
import type { Reservation } from "@/features/reservations/schemas";

type ReservationTableProps = {
  readonly reservations: readonly Reservation[];
};

const columns = [
  { key: "reservation", label: "예약 ID", kind: "identifier" },
  { key: "room", label: "방 ID", kind: "identifier" },
  { key: "student", label: "학생 ID", kind: "identifier" },
  { key: "host", label: "호스트 ID", kind: "identifier" },
  { key: "status", label: "상태" },
  { key: "moveIn", label: "입주 희망·거주 기간" },
  { key: "created", label: "생성일" },
] as const;

function reservationIdLink(id: string): ReactNode {
  return (
    <Link
      className="admin-focus admin-break-anywhere text-brand underline decoration-brand/40 underline-offset-2 hover:text-brand-hover"
      href={`/reservations/${id}`}
    >
      {id}
    </Link>
  );
}

export function ReservationTable({ reservations }: ReservationTableProps) {
  const rows: readonly AdminTableRow[] = reservations.map((reservation) => ({
    key: reservation.id,
    cells: [
      reservationIdLink(reservation.id),
      <span key="room" className="admin-break-anywhere">
        {reservation.roomId}
      </span>,
      <span key="student" className="admin-break-anywhere">
        {reservation.studentId}
      </span>,
      <span key="host" className="admin-break-anywhere">
        {reservation.hostId}
      </span>,
      <Badge
        className="min-w-max whitespace-nowrap"
        key="status"
        variant={RESERVATION_STATUS_VARIANTS[reservation.reservationStatus]}
      >
        {RESERVATION_STATUS_LABELS[reservation.reservationStatus]}
      </Badge>,
      <span key="move-in" className="grid gap-1">
        <span>{formatReservationDate(reservation.desiredMoveInDate)}</span>
        <span className="text-compact text-ink-subtle">
          {formatReservationStay(reservation.desiredStayMonths)}
        </span>
      </span>,
      formatReservationDate(reservation.createdAt),
    ],
  }));

  return (
    <TableShell
      caption="예약 목록"
      columns={columns}
      rows={rows}
    />
  );
}
