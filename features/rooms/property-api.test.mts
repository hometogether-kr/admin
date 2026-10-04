import assert from "node:assert/strict";
import test from "node:test";

import { AdminApiError, adminApiFailureResult } from "@/lib/api/errors";
import { ADMIN_OPERATIONS } from "@/lib/api/operations";
import { buildAdminOperationPath } from "@/lib/api/request-path";
import { PROPERTY_ROOM_ID } from "./test-fixtures/property-room";

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

for (const [status, message] of [
  [400, "요청 내용을 확인해 주세요."], [401, "로그인이 만료되었습니다. 다시 로그인해 주세요."],
  [403, "이 작업을 수행할 권한이 없습니다."], [409, "다른 변경과 충돌했습니다. 새로고침 후 다시 시도해 주세요."],
] as const) {
  test(`${status} 오류는 원본 진단을 노출하지 않는다`, () => {
    const error = new AdminApiError({ kind: "http", operationId: "ROM-15", status, cause: new Error("private diagnostic") });
    assert.deepEqual(adminApiFailureResult(error), { kind: "error", message });
  });
}
