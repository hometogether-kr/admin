import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/ui/empty-state";

import { listReservations } from "@/features/reservations/queries";
import { ReservationTable } from "@/features/reservations/reservation-table";

export default async function ReservationsPage() {
  const reservations = await listReservations("/reservations");

  return (
    <section className="grid gap-6">
      <PageHeader
        description="방·학생·호스트 예약의 현재 상태와 입주 희망 정보를 확인합니다."
        title="예약"
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
