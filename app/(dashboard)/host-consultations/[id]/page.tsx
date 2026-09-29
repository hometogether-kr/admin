import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { HostConsultationDetail } from "@/features/host-consultations/detail";
import { readHostConsultation } from "@/features/host-consultations/queries";
import { hostConsultationIdSchema } from "@/features/host-consultations/schema";
import { AdminApiError } from "@/lib/api/errors";

type HostConsultationDetailPageProps = {
  readonly params: Promise<{ readonly id: string }>;
};

export default async function HostConsultationDetailPage({
  params,
}: HostConsultationDetailPageProps) {
  const { id } = await params;
  const parsedId = hostConsultationIdSchema.safeParse(id);
  if (!parsedId.success) notFound();

  let consultation;
  try {
    consultation = await readHostConsultation(parsedId.data);
  } catch (cause) {
    if (cause instanceof AdminApiError && cause.status === 404) notFound();
    throw cause;
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        description="신청자의 상담 조건, 연락처와 개인정보 동의 기록을 확인합니다."
        eyebrow={
          <Link
            className="admin-focus text-brand underline-offset-4 hover:underline"
            href="/host-consultations"
          >
            상담 신청 목록
          </Link>
        }
        title="상담 신청 상세"
      />
      <HostConsultationDetail consultation={consultation} />
    </div>
  );
}
