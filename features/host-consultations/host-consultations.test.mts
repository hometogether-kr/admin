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
