import assert from "node:assert/strict";
import test from "node:test";
import { AdminApiError, adminApiFailureResult } from "@/lib/api/errors";
import { PROPERTY_ROOM_ID } from "./test-fixtures/property-room";

import * as errors from "@/lib/api/errors";

test("HTTP 오류 응답의 검증된 코드를 화면 안내까지 전달한다", async () => {
  assert.equal(typeof errors.adminApiStatusError, "function");
  const response = Response.json({
    statusCode: 409, message: "private upstream diagnostic", code: "ROOM_ADDRESS_VERIFICATION_REQUIRED",
    path: `/admin/rooms/${PROPERTY_ROOM_ID}/approvals`, timestamp: "2026-10-12T00:00:00.000Z",
  }, { status: 409 });
  const error = await errors.adminApiStatusError(response, "ROM-03");
  assert.ok(error instanceof AdminApiError);
  assert.equal(error.code, "ROOM_ADDRESS_VERIFICATION_REQUIRED");
  assert.equal(adminApiFailureResult(error).message, "주소 확인을 완료한 뒤 게시해 주세요.");
});

for (const payload of [{ code: "ROOM_ADDRESS_VERIFICATION_REQUIRED" }, { statusCode: 409, code: 123 }]) {
  test("구조가 잘못된 오류 응답의 코드로 구체적인 안내를 만들지 않는다", async () => {
    assert.equal(typeof errors.adminApiStatusError, "function");
    const error = await errors.adminApiStatusError(Response.json(payload, { status: 409 }), "ROM-03");
    assert.equal(error.code, undefined);
    assert.match(adminApiFailureResult(error).message, /다른 변경과 충돌/);
  });
}
