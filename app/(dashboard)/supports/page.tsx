import { PageHeader } from "@/components/admin/page-header";
import { SupportFilters } from "@/features/supports/support-filters";
import { SupportListView } from "@/features/supports/support-list";
import {
  parseSupportListQuery,
  type SupportSearchParams,
} from "@/features/supports/query-state";
import { readSupports } from "@/features/supports/queries";

type SupportsPageProps = {
  readonly searchParams: Promise<SupportSearchParams>;
};

export default async function SupportsPage({
  searchParams,
}: SupportsPageProps) {
  const query = parseSupportListQuery(await searchParams);
  const supports = await readSupports(query);

  return (
    <div className="grid gap-6">
      <PageHeader
        description="접수된 고객 문의를 유형과 상태로 좁혀 보고 처리 기록을 확인합니다."
        title="고객 문의"
      />
      <SupportFilters />
      <SupportListView data={supports} query={query} />
    </div>
  );
}
