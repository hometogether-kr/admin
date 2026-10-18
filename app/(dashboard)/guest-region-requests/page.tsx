import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuestRegionRequestListView } from "@/features/guest-region-requests/list";
import { readGuestRegionRequests } from "@/features/guest-region-requests/queries";
import { GuestRegionRefreshButton } from "@/features/guest-region-requests/refresh-button";
import {
  guestRegionCanonicalPage,
  guestRegionListHref,
  parseGuestRegionListQuery,
  type GuestRegionSearchParams,
} from "@/features/guest-region-requests/query-state";

export default async function GuestRegionRequestsPage({
  searchParams,
}: {
  readonly searchParams: Promise<GuestRegionSearchParams>;
}) {
  const query = parseGuestRegionListQuery(await searchParams);
  const requests = await readGuestRegionRequests(query);
  const canonicalPage = guestRegionCanonicalPage(
    query.page,
    requests.totalPages,
  );
  if (canonicalPage !== query.page)
    redirect(guestRegionListHref(query, canonicalPage));

  return (
    <div className="grid gap-6">
      <PageHeader
        title="게스트 희망 지역 요청"
        description="게스트가 찾고 싶은 동네·학교 등 희망 지역 요청을 확인합니다."
        actions={<GuestRegionRefreshButton />}
      />
      <form
        action="/guest-region-requests"
        method="get"
        aria-label="희망 지역 요청 목록 조회 조건"
        className="flex flex-wrap items-end gap-3 rounded-panel border border-line-subtle bg-surface p-4"
      >
        <input name="page" type="hidden" value="1" />
        <Input
          defaultValue={query.limit}
          id="guest-region-page-limit"
          label="페이지당 항목"
          name="limit"
          type="number"
          min={1}
          max={100}
          required
        />
        <Button type="submit" variant="primary">
          적용
        </Button>
      </form>
      <GuestRegionRequestListView data={requests} query={query} />
    </div>
  );
}
