import assert from "node:assert/strict";
import test from "node:test";

import { AdminApiError, adminApiFailureResult } from "@/lib/api/errors";
import { ADMIN_OPERATIONS } from "@/lib/api/operations";
import { buildAdminOperationPath } from "@/lib/api/request-path";
import { PROPERTY_ROOM_ID } from "./test-fixtures/property-room";
import { adminHttpErrorSchema } from "@/lib/api/http-error-schema";

for (const [id, suffix] of [
  ["ROM-13", "metadata"], ["ROM-14", "address"], ["ROM-15", "address/verify"],
]) {
  test(`${id}은 정확한 매물 식별자를 사용해 API 경로를 구성한다`, () => {
    const operation = ADMIN_OPERATIONS.find((item) => item.id === id);
    assert.ok(operation);
    assert.equal(buildAdminOperationPath(operation, { id: PROPERTY_ROOM_ID }), `/admin/rooms/${PROPERTY_ROOM_ID}/${suffix}`);
    assert.throws(() => buildAdminOperationPath(operation, { id: "../other" }), { name: "AdminApiError", kind: "request" });
    assert.throws(() => buildAdminOperationPath(operation, { id: PROPERTY_ROOM_ID, extra: PROPERTY_ROOM_ID }), { name: "AdminApiError", kind: "request" });
  });
}

for (const [code, status, message] of [
  ["ROOM_ADDRESS_VERIFICATION_REQUIRED", 409, "주소 확인을 완료한 뒤 게시해 주세요."],
  ["ROOM_PUBLICATION_NOT_ALLOWED", 409, "현재 매물 상태에서는 게시할 수 없습니다. 최신 상태를 확인해 주세요."],
  ["ROOM_HIDE_NOT_ALLOWED", 409, "공개 중인 게시 매물만 숨길 수 있습니다. 최신 상태를 확인해 주세요."],
  ["ROOM_ADMIN_EDIT_NOT_ALLOWED", 409, "제출된 등록 계약 v2 매물만 주소·메타데이터를 수정할 수 있습니다."],
  ["ROOM_ADDRESS_INCOMPLETE", 400, "주소 확인에 필요한 주소·시도·시군구·법정동·코드와 건물 유형을 보완해 주세요."],
  ["ROOM_ADDRESS_REGION_MISMATCH", 400, "도로명 또는 지번 주소와 시도·시군구가 일치하도록 보정해 주세요."],
] as const) {
  test(`${code}를 검증하고 원문 대신 필요한 조치를 표시한다`, () => {
    const parsed = adminHttpErrorSchema.parse({ code, statusCode: status, message: "private diagnostic",
      path: "/admin/rooms/r/approvals", timestamp: "2026-10-12T00:00:00.000Z" });
    const error = new AdminApiError({ kind: "http", operationId: "ROM-03", status, code: parsed.code });
    assert.deepEqual(adminApiFailureResult(error), { kind: "error", message });
  });
}

test("알 수 없는 오류 코드와 인증 실패는 기존 안내를 유지한다", () => {
  assert.deepEqual(adminApiFailureResult(new AdminApiError({ kind: "http", operationId: "ROM-03", status: 409, code: "UNKNOWN_CODE" })),
    { kind: "error", message: "다른 변경과 충돌했습니다. 새로고침 후 다시 시도해 주세요." });
  assert.deepEqual(adminApiFailureResult(new AdminApiError({ kind: "http", operationId: "ROM-03", status: 401, code: "ROOM_ADDRESS_VERIFICATION_REQUIRED" })),
    { kind: "error", message: "로그인이 만료되었습니다. 다시 로그인해 주세요." });
});

for (const [status, message] of [
  [400, "요청 내용을 확인해 주세요."], [401, "로그인이 만료되었습니다. 다시 로그인해 주세요."],
  [403, "이 작업을 수행할 권한이 없습니다."], [409, "다른 변경과 충돌했습니다. 새로고침 후 다시 시도해 주세요."],
] as const) {
  test(`${status} 오류는 원본 진단을 노출하지 않는다`, () => {
    const error = new AdminApiError({ kind: "http", operationId: "ROM-15", status, cause: new Error("private diagnostic") });
    assert.deepEqual(adminApiFailureResult(error), { kind: "error", message });
  });
}
