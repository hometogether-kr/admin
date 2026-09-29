import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  HOST_CONSULTATION_HOUSING_OPTIONS,
  HOST_CONSULTATION_REGION_OPTIONS,
  HOST_CONSULTATION_STATUS_OPTIONS,
} from "@/features/host-consultations/presentation";
import type { HostConsultationListQuery } from "@/features/host-consultations/query-state";

type HostConsultationFiltersProps = {
  readonly query: HostConsultationListQuery;
};

export function HostConsultationFilters({
  query,
}: HostConsultationFiltersProps) {
  return (
    <form
      action="/host-consultations"
      aria-label="상담 신청 목록 필터"
      className="grid gap-4 rounded-panel border border-line-subtle bg-surface p-4 md:grid-cols-2 xl:grid-cols-4"
      method="get"
    >
      <input name="page" type="hidden" value="1" />
      <Select
        defaultValue={query.regionType ?? ""}
        id="host-consultation-region-type"
        label="지역 유형"
        name="regionType"
        options={HOST_CONSULTATION_REGION_OPTIONS}
      />
      <Select
        defaultValue={query.housingType ?? ""}
        id="host-consultation-housing-type"
        label="주택 형태"
        name="housingType"
        options={HOST_CONSULTATION_HOUSING_OPTIONS}
      />
      <Select
        defaultValue={query.status ?? ""}
        id="host-consultation-status"
        label="처리 상태"
        name="status"
        options={HOST_CONSULTATION_STATUS_OPTIONS}
      />
      <Input
        defaultValue={query.limit}
        id="host-consultation-page-limit"
        label="페이지당 항목"
        max={100}
        min={1}
        name="limit"
        required
        type="number"
      />
      <div className="flex flex-wrap items-center gap-2 md:col-span-2 md:justify-end xl:col-span-4">
        <Link
          className="admin-focus admin-interactive admin-control inline-flex items-center justify-center rounded-control border border-line bg-surface px-4 text-body font-semibold text-ink-strong hover:border-line-strong hover:bg-surface-subtle active:bg-surface-pressed"
          href="/host-consultations"
        >
          초기화
        </Link>
        <Button type="submit" variant="primary">
          필터 적용
        </Button>
      </div>
    </form>
  );
}
