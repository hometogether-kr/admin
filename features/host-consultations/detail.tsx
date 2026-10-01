import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { DefinitionList } from "@/components/ui/definition-list";
import {
  formatHostConsultationDateTime,
  hostConsultationHousingTypeLabel,
  hostConsultationRegionTypeLabel,
  hostConsultationStatusMeta,
} from "@/features/host-consultations/presentation";
import type { HostConsultation } from "@/features/host-consultations/schema";

type HostConsultationDetailProps = {
  readonly consultation: HostConsultation;
};

function Identifier({ children }: { readonly children: string }) {
  return <span className="font-mono tabular-nums">{children}</span>;
}

export function HostConsultationDetail({
  consultation,
}: HostConsultationDetailProps) {
  const status = hostConsultationStatusMeta(consultation.status);

  return (
    <div className="grid gap-8">
      <section aria-labelledby="consultation-reception-title" className="grid gap-3">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="consultation-reception-title"
        >
          접수 정보
        </h2>
        <DefinitionList
          items={[
            { label: "신청 ID", value: <Identifier>{consultation.id}</Identifier> },
            {
              label: "회원 ID",
              value:
                consultation.userId === null ? (
                  "비회원 신청"
                ) : (
                  <Identifier>{consultation.userId}</Identifier>
                ),
            },
            {
              label: "처리 상태",
              value: <Badge variant={status.variant}>{status.label}</Badge>,
            },
            { label: "신청 경로", value: consultation.source },
            {
              label: "신청 시각",
              value: formatHostConsultationDateTime(consultation.createdAt),
            },
            {
              label: "최근 수정",
              value: formatHostConsultationDateTime(consultation.updatedAt),
            },
          ]}
        />
      </section>

      <section aria-labelledby="consultation-property-title" className="grid gap-3">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="consultation-property-title"
        >
          주택 및 지역
        </h2>
        <DefinitionList
          items={[
            {
              label: "지역 유형",
              value: hostConsultationRegionTypeLabel(consultation.regionType),
            },
            { label: "상담 지역", value: consultation.regionName },
            {
              label: "지역 ID",
              value:
                consultation.regionId === null ? (
                  "직접 입력"
                ) : (
                  <Identifier>{consultation.regionId}</Identifier>
                ),
            },
            {
              label: "직접 입력 대학교",
              value: consultation.customUniversityName ?? "해당 없음",
            },
            {
              label: "직접 입력 지하철역",
              value: consultation.customSubwayName ?? "해당 없음",
            },
            { label: "방 개수", value: `${consultation.roomCount}개` },
            {
              label: "에어컨",
              value: consultation.hasAirConditioner ? "있음" : "없음",
            },
            {
              label: "주택 형태",
              value: hostConsultationHousingTypeLabel(consultation.housingType),
            },
          ]}
        />
      </section>

      <section aria-labelledby="consultation-contact-title" className="grid gap-3">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="consultation-contact-title"
        >
          연락처 및 개인정보 동의
        </h2>
        <DefinitionList
          items={[
            {
              label: "입력 연락처",
              value: (
                <a
                  className="admin-focus text-brand underline underline-offset-4 hover:text-brand-hover"
                  href={`tel:${consultation.normalizedPhone}`}
                >
                  {consultation.phone}
                </a>
              ),
            },
            {
              label: "정규화 연락처",
              value: <Identifier>{consultation.normalizedPhone}</Identifier>,
            },
            {
              label: "개인정보 동의",
              value: "동의",
            },
            {
              label: "동의 시각",
              value: formatHostConsultationDateTime(
                consultation.privacyConsentAgreedAt,
              ),
            },
            {
              label: "동의 문구 버전",
              value: consultation.privacyConsentVersion,
            },
          ]}
        />
      </section>

      <Link
        className="admin-focus admin-interactive admin-control justify-self-start rounded-control border border-line bg-surface px-4 py-2 text-body font-semibold text-ink-strong hover:border-line-strong hover:bg-surface-subtle"
        href="/host-consultations"
      >
        상담 신청 목록으로 돌아가기
      </Link>
    </div>
  );
}
