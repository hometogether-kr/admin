import { PageHeader } from "@/components/admin/page-header";
import { redirect } from "next/navigation";
import { HostConsultationFilters } from "@/features/host-consultations/filters";
import { HostConsultationListView } from "@/features/host-consultations/list";
import {
  hostConsultationCanonicalPage,
  hostConsultationListHref,
  parseHostConsultationListQuery,
  type HostConsultationSearchParams,
} from "@/features/host-consultations/query-state";
import { readHostConsultations } from "@/features/host-consultations/queries";

type HostConsultationsPageProps = {
  readonly searchParams: Promise<HostConsultationSearchParams>;
};

export default async function HostConsultationsPage({
  searchParams,
}: HostConsultationsPageProps) {
  const query = parseHostConsultationListQuery(await searchParams);
  const consultations = await readHostConsultations(query);
  const canonicalPage = hostConsultationCanonicalPage(
    query.page,
    consultations.totalPages,
  );
  if (canonicalPage !== query.page) {
    redirect(hostConsultationListHref(query, canonicalPage));
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        description="접수된 내 집 상담 신청을 조건별로 조회하고 상세 내용을 확인합니다."
        title="상담 신청"
      />
      <HostConsultationFilters query={query} />
      <HostConsultationListView data={consultations} query={query} />
    </div>
  );
}
