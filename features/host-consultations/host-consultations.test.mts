import assert from "node:assert/strict";
import test from "node:test";

import {
  hostConsultationCanonicalPage,
  hostConsultationListHref,
  parseHostConsultationListQuery,
} from "./query-state";
import {
  hostConsultationHousingTypeLabel,
  hostConsultationRegionTypeLabel,
  hostConsultationStatusMeta,
} from "./presentation";
import { hostConsultationListSchema } from "./schema";

test("목록 쿼리는 허용된 필터와 페이지 값을 보존한다", () => {
  const query = parseHostConsultationListQuery({
    housingType: "leased_or_rented",
    limit: "50",
    page: "3",
    regionType: "custom_university",
    status: "contacted",
  });

  assert.deepEqual(query, {
    housingType: "leased_or_rented",
    limit: 50,
    page: 3,
    regionType: "custom_university",
    status: "contacted",
  });
  assert.equal(
    hostConsultationListHref(query, 2),
    "/host-consultations?page=2&limit=50&regionType=custom_university&housingType=leased_or_rented&status=contacted",
  );
});

test("잘못된 목록 쿼리는 안전한 기본값으로 정규화한다", () => {
  assert.deepEqual(
    parseHostConsultationListQuery({
      limit: "101",
      page: "0",
      regionType: "invalid",
      status: ["pending", "closed"],
    }),
    {
      housingType: undefined,
      limit: 20,
      page: 1,
      regionType: undefined,
      status: undefined,
    },
  );
});

test("요청 페이지가 마지막 페이지를 넘으면 마지막 유효 페이지로 보정한다", () => {
  assert.equal(hostConsultationCanonicalPage(999, 2), 2);
  assert.equal(hostConsultationCanonicalPage(2, 2), 2);
  assert.equal(hostConsultationCanonicalPage(1, 0), 1);
});

test("상담 코드값은 관리자 화면용 한글 라벨로 표시한다", () => {
  assert.equal(hostConsultationRegionTypeLabel("subway"), "지하철역");
  assert.equal(hostConsultationHousingTypeLabel("owned"), "자가");
  assert.deepEqual(hostConsultationStatusMeta("pending"), {
    label: "접수 대기",
    variant: "warning",
  });
});

test("기타 지하철역이 포함된 최신 상담 목록 응답을 허용한다", () => {
  const response = hostConsultationListSchema.parse({
    items: [
      {
        id: "30000000-0000-4000-8000-000000000001",
        userId: null,
        regionType: "custom_subway",
        regionId: null,
        regionName: "경춘선숲길역",
        customUniversityName: null,
        customSubwayName: "경춘선숲길역",
        roomCount: 2,
        hasAirConditioner: true,
        housingType: "owned",
        phone: "010-1234-5678",
        normalizedPhone: "+821012345678",
        privacyConsentAgreed: true,
        privacyConsentAgreedAt: "2026-09-30T06:00:00.000Z",
        privacyConsentVersion: "host_consultation_v1",
        source: "host_income_calculator",
        status: "pending",
        createdAt: "2026-09-30T06:00:00.000Z",
        updatedAt: "2026-09-30T06:00:00.000Z",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  assert.equal(response.items[0]?.customSubwayName, "경춘선숲길역");
  assert.equal(
    hostConsultationRegionTypeLabel(response.items[0]!.regionType),
    "지하철역 직접 입력",
  );
});
