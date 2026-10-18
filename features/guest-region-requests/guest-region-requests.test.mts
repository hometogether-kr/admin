import assert from "node:assert/strict";
import test from "node:test";

import { ADMIN_OPERATIONS } from "@/lib/api/operations";
import {
  buildAdminOperationPath,
  buildAdminSearchParams,
} from "@/lib/api/request-path";
import { ADMIN_MENU_ITEMS, roleCanAccessMenu } from "@/lib/auth/roles";
import { normalizeReturnTo } from "@/lib/auth/return-to";
import { config } from "@/proxy";
import {
  guestRegionCanonicalPage,
  guestRegionListHref,
  parseGuestRegionListQuery,
} from "./query-state";
import { guestRegionRequestListSchema } from "./schema";
import { formatGuestRegionDateTime } from "./presentation";

const response = {
  items: [
    {
      id: "30000000-0000-4000-8000-000000000001",
      region: "서울여대 근처",
      createdAt: "2026-10-18T00:00:00.000Z",
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
};

test("API의 희망 지역과 접수 시각을 검증하고 빈 목록도 허용한다", () => {
  assert.deepEqual(guestRegionRequestListSchema.parse(response), response);
  assert.deepEqual(
    guestRegionRequestListSchema.parse({ ...response, items: [], total: 0 }),
    { ...response, items: [], total: 0 },
  );
});

for (const item of [
  { ...response.items[0], id: "invalid" },
  { ...response.items[0], region: "" },
  { ...response.items[0], region: "가".repeat(101) },
  { ...response.items[0], createdAt: "invalid" },
  { ...response.items[0], phone: "unrequested" },
]) {
  test("잘못된 응답을 정상 목록으로 표시하지 않는다", () => {
    assert.equal(
      guestRegionRequestListSchema.safeParse({ ...response, items: [item] })
        .success,
      false,
    );
  });
}

test("100을 초과하는 응답 페이지 크기를 거절한다", () => {
  assert.equal(
    guestRegionRequestListSchema.safeParse({ ...response, limit: 101 }).success,
    false,
  );
});

test("페이지 조건을 보존하고 안전한 목록 링크를 생성한다", () => {
  const query = parseGuestRegionListQuery({ page: "3", limit: "50" });
  assert.deepEqual(query, { page: 3, limit: 50 });
  assert.equal(
    guestRegionListHref(query, 2),
    "/guest-region-requests?page=2&limit=50",
  );
  assert.equal(guestRegionCanonicalPage(999, 2), 2);
  assert.equal(guestRegionCanonicalPage(1, 0), 1);
});

for (const invalid of [
  "0",
  "-1",
  "1.5",
  "1e2",
  "invalid",
  "999999999999999999999",
  ["1", "2"],
]) {
  test("잘못되거나 중복된 페이지 값은 기본값으로 보정한다", () => {
    assert.equal(parseGuestRegionListQuery({ page: invalid }).page, 1);
  });
}

test("페이지 크기는 API 범위 안에서만 허용한다", () => {
  assert.deepEqual(parseGuestRegionListQuery({ limit: "101" }), {
    page: 1,
    limit: 20,
  });
  assert.equal(parseGuestRegionListQuery({ limit: "100" }).limit, 100);
});

test("게스트 희망 지역 요청은 집주인 상담과 별도이며 CS·super에게만 허용한다", () => {
  const operation = ADMIN_OPERATIONS.find((item) => item.id === "GRR-01");
  assert.ok(operation);
  assert.equal(
    buildAdminOperationPath(operation, undefined),
    "/admin/guest-region-requests",
  );
  assert.deepEqual(operation.roles, ["cs", "super"]);
  assert.equal(
    buildAdminSearchParams(operation, { page: 2, limit: 20 })?.toString(),
    "page=2&limit=20",
  );
  assert.throws(() => buildAdminSearchParams(operation, { status: "pending" }));
  const menu = ADMIN_MENU_ITEMS.find(
    (item) => item.id === "guestRegionRequests",
  );
  assert.equal(menu?.path, "/guest-region-requests");
  for (const role of ["cs", "super"] as const)
    assert.equal(roleCanAccessMenu(role, "guestRegionRequests"), true);
  for (const role of ["room", "payment", "reservation"] as const)
    assert.equal(roleCanAccessMenu(role, "guestRegionRequests"), false);
  assert.ok(config.matcher.includes("/guest-region-requests/:path*"));
});

test("재로그인 후 목록의 페이지로 복귀하되 외부 경로나 임의 쿼리는 거절한다", () => {
  assert.equal(
    normalizeReturnTo("/guest-region-requests?page=2&limit=20"),
    "/guest-region-requests?page=2&limit=20",
  );
  assert.equal(
    normalizeReturnTo("/guest-region-requests?redirect=https://example.com"),
    "/",
  );
  assert.equal(normalizeReturnTo("/guest-region-requests/any-id"), "/");
});

test("접수 시각은 서울 시간으로 표시한다", () => {
  assert.match(
    formatGuestRegionDateTime("2026-10-18T00:00:00.000Z"),
    /2026.*10.*18/,
  );
  assert.match(formatGuestRegionDateTime("2026-10-18T00:00:00.000Z"), /9:00/);
});
