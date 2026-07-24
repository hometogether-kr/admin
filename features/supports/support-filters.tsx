"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  SUPPORT_INQUIRY_TYPE_OPTIONS,
  SUPPORT_STATUS_OPTIONS,
} from "@/features/supports/presentation";
type FilterValues = {
  readonly inquiryType: string;
  readonly limit: string;
  readonly status: string;
};

type FilterDraft = {
  readonly search: string;
  readonly values: FilterValues;
};

type SearchParamsReader = Pick<URLSearchParams, "getAll">;

function allowedValue(
  searchParams: SearchParamsReader,
  name: string,
  options: readonly { readonly value: string }[],
): string {
  const values = searchParams.getAll(name);
  if (values.length !== 1) return "";
  return options.some((option) => option.value === values[0]) ? values[0] : "";
}

function filterValues(searchParams: SearchParamsReader): FilterValues {
  const limits = searchParams.getAll("limit");
  const limit = limits.length === 1 && /^[1-9][0-9]*$/u.test(limits[0])
    ? Number(limits[0])
    : 20;
  return {
    inquiryType: allowedValue(
      searchParams,
      "inquiryType",
      SUPPORT_INQUIRY_TYPE_OPTIONS,
    ),
    limit: String(limit <= 100 ? limit : 20),
    status: allowedValue(searchParams, "status", SUPPORT_STATUS_OPTIONS),
  };
}

export function SupportFilters() {
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const urlValues = filterValues(searchParams);
  const [draft, setDraft] = useState<FilterDraft>(() => ({
    search,
    values: urlValues,
  }));
  const values = draft.search === search ? draft.values : urlValues;

  useEffect(() => {
    function synchronizeWithLocation() {
      const locationSearchParams = new URLSearchParams(window.location.search);
      setDraft({
        search: locationSearchParams.toString(),
        values: filterValues(locationSearchParams),
      });
    }

    synchronizeWithLocation();
    window.addEventListener("pageshow", synchronizeWithLocation);
    window.addEventListener("popstate", synchronizeWithLocation);
    return () => {
      window.removeEventListener("pageshow", synchronizeWithLocation);
      window.removeEventListener("popstate", synchronizeWithLocation);
    };
  }, []);

  function updateValues(nextValues: Partial<FilterValues>) {
    setDraft({ search, values: { ...values, ...nextValues } });
  }

  return (
    <form
      action="/supports"
      aria-label="문의 목록 필터"
      className="grid gap-4 rounded-panel border border-line-subtle bg-surface p-4 md:grid-cols-3"
      method="get"
    >
      <input name="page" type="hidden" value="1" />
      <Select
        id="support-status"
        label="처리 상태"
        name="status"
        onChange={(event) => updateValues({ status: event.currentTarget.value })}
        options={SUPPORT_STATUS_OPTIONS}
        value={values.status}
      />
      <Select
        id="support-inquiry-type"
        label="문의 유형"
        name="inquiryType"
        onChange={(event) =>
          updateValues({ inquiryType: event.currentTarget.value })
        }
        options={SUPPORT_INQUIRY_TYPE_OPTIONS}
        value={values.inquiryType}
      />
      <Input
        id="support-page-limit"
        label="페이지당 항목"
        max={100}
        min={1}
        name="limit"
        onChange={(event) => updateValues({ limit: event.currentTarget.value })}
        required
        type="number"
        value={values.limit}
      />
      <div className="flex flex-wrap items-center gap-2 md:col-span-3 md:justify-end">
        <Link
          className="admin-focus admin-interactive admin-control inline-flex items-center justify-center rounded-control border border-line bg-surface px-4 text-body font-semibold text-ink-strong hover:border-line-strong hover:bg-surface-subtle active:bg-surface-pressed"
          href="/supports"
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
