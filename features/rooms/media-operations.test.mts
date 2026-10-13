import assert from "node:assert/strict";
import test from "node:test";
import { adminApiFailureResult, adminApiStatusError } from "@/lib/api/errors";
import { PROPERTY_ROOM_ID } from "./test-fixtures/property-room";

test("마지막 사진 삭제 차단은 최소 사진 유지 안내를 표시한다", async () => {
  const error = await adminApiStatusError(Response.json({
    statusCode: 409, code: "ROOM_LAST_PHOTO_REQUIRED", message: "private diagnostic",
    path: `/admin/rooms/${PROPERTY_ROOM_ID}/media/photo`, timestamp: "2026-10-13T00:00:00.000Z",
  }, { status: 409 }), "ROM-10");
  assert.deepEqual(adminApiFailureResult(error), {
    kind: "error", message: "매물 사진은 최소 한 장을 유지해야 합니다. 마지막 사진은 삭제할 수 없습니다.",
  });
});
