import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/ui/empty-state";

import { ReservationListFilter } from "@/features/reservations/reservation-list-filter";
import { listReservations } from "@/features/reservations/queries";
import { ReservationTable } from "@/features/reservations/reservation-table";
import { parseReservationListQuery } from "@/features/reservations/schemas";

type ReservationsPageProps = {
  readonly searchParams: Promise<
    Record<string, string | readonly string[] | undefined>
  >;
};

export default async function ReservationsPage({
  searchParams,
}: ReservationsPageProps) {
  const query = parseReservationListQuery(await searchParams);
  const reservations = await listReservations(query);

  return (
    <section className="grid gap-6">
      <PageHeader
        description="방·학생·호스트 예약의 현재 상태와 입주 희망 정보를 확인합니다."
        title="예약"
      />
      <ReservationListFilter
        key={query.status ?? "all"}
        status={query.status}
      />
      {reservations.length === 0 ? (
        <EmptyState
          description="예약이 없습니다. 새 예약은 여기에 표시됩니다."
          title="예약이 없습니다"
        />
      ) : (
        <ReservationTable reservations={reservations} />
      )}
    </section>
  );
}
