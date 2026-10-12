import assert from "node:assert/strict";
import test from "node:test";
import { roomDetailSchema } from "./detail-schema";
import { propertyRoomFixture } from "./test-fixtures/property-room";

test("관리자 상세에서 저장된 숨김 설정·메모와 숨겨진 전체 주소를 읽는다", () => {
  const payload = { ...propertyRoomFixture(), isAddressDetailHidden: true, internalMemo: "현장 확인 완료" };
  const result = roomDetailSchema.parse(payload);
  assert.equal(Reflect.get(result, "isAddressDetailHidden"), true);
  assert.equal(Reflect.get(result, "internalMemo"), "현장 확인 완료");
  if (result.registrationContractVersion !== 2) throw new Error("Expected version 2");
  assert.equal(result.data.location.addressDetail, "101동 302호");
});

test("운영 정보가 누락된 상세 응답을 기본값으로 보완하지 않는다", () => {
  const payload = { ...propertyRoomFixture(), isAddressDetailHidden: false, internalMemo: null };
  for (const field of ["isAddressDetailHidden", "internalMemo"]) {
    const incomplete = { ...payload };
    Reflect.deleteProperty(incomplete, field);
    assert.equal(roomDetailSchema.safeParse(incomplete).success, false);
  }
  assert.equal(roomDetailSchema.safeParse(payload).success, true);
});
