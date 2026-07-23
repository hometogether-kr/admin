"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  RESERVATION_STATUSES,
  RESERVATION_STATUS_LABELS,
  type ReservationStatus,
} from "@/features/reservations/constants";
import { reservationListHref } from "@/features/reservations/list-filter";

type ReservationListFilterProps = {
  readonly status: ReservationStatus | undefined;
};

function isReservationStatus(value: string): value is ReservationStatus {
  return RESERVATION_STATUSES.some((status) => status === value);
}

export function ReservationListFilter({
  status,
}: ReservationListFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState<ReservationStatus | "">(
    status ?? "",
  );

  return (
    <form
      aria-label="예약 목록 필터"
      className="grid items-end gap-4 rounded-panel border border-line-subtle bg-surface-subtle p-4 sm:grid-cols-[minmax(0,20rem)_auto] sm:justify-start"
      onSubmit={(event) => {
        event.preventDefault();
        const nextStatus = selectedStatus === "" ? undefined : selectedStatus;
        startTransition(() => {
          router.push(reservationListHref(nextStatus));
        });
      }}
    >
      <Select
        disabled={isPending}
        id="reservation-status-filter"
        label="예약 상태"
        name="status"
        onChange={(event) => {
          const value = event.currentTarget.value;
          setSelectedStatus(
            value === "" || isReservationStatus(value) ? value : "",
          );
        }}
        options={[
          { label: "전체 상태", value: "" },
          ...RESERVATION_STATUSES.map((value) => ({
            label: RESERVATION_STATUS_LABELS[value],
            value,
          })),
        ]}
        value={selectedStatus}
      />
      <Button
        className="w-full sm:w-auto"
        loading={isPending}
        type="submit"
        variant="primary"
      >
        필터 적용
      </Button>
    </form>
  );
}
