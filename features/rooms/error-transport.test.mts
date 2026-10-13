import assert from "node:assert/strict";
import test from "node:test";
import { AdminApiError, adminApiFailureResult } from "@/lib/api/errors";
import { PROPERTY_ROOM_ID } from "./test-fixtures/property-room";

import * as errors from "@/lib/api/errors";

for (const [code, message] of [
  ["ROOM_ACTIVE_RESERVATIONS_EXIST", "활성 예약이 있어 삭제할 수 없습니다. 예약 현황을 확인해 주세요."],
  ["ROOM_DELETION_NOT_ALLOWED", "작성 중인 매물은 관리자에서 삭제할 수 없습니다. 매물 상태를 확인해 주세요."],
] as const) {
  test(`매물 삭제의 ${code} 응답을 원인과 조치 안내로 연결한다`, async () => {
    const response = Response.json({
      statusCode: 409, message: "private upstream diagnostic", code,
      path: `/admin/rooms/${PROPERTY_ROOM_ID}`, timestamp: "2026-10-13T00:00:00.000Z",
    }, { status: 409 });
    const error = await errors.adminApiStatusError(response, "ROM-11");
    assert.equal(error.code, code);
    assert.deepEqual(adminApiFailureResult(error), { kind: "error", message });
  });
}

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
