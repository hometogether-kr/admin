import assert from "node:assert/strict";
import test from "node:test";

import * as forms from "./action-schema";
import * as detail from "./detail-schema";
import { registrationRoomSchema } from "./registration-schema";
import { propertyRoomFixture, PROPERTY_ROOM_ID } from "./test-fixtures/property-room";
import { ADMIN_OPERATIONS } from "@/lib/api/operations";

const location = registrationRoomSchema.parse(propertyRoomFixture()).data.location;
function addressInput() {
  return {
    buildingType: "officetel", buildingTypeOther: "",
    addressRoad: location.addressRoad, addressJibun: location.addressJibun,
    addressDetail: location.addressDetail, legalDongCode: location.legalDongCode,
    legalDongName: location.legalDongName, sido: location.sido, sigungu: location.sigungu,
    buildingDong: location.buildingDong, unitNumber: location.unitNumber,
    latitude: "37.56", longitude: "126.92",
  };
}

test("소제목을 trim하고 빈 소제목·층수를 명시적 null로 전송한다", () => {
  assert.ok(forms.roomMetadataFormSchema, "metadata form contract required");
  assert.deepEqual(forms.roomMetadataFormSchema.parse({ subtitle: "  햇살 좋은 집  ", floor: "-1" }),
    { subtitle: "햇살 좋은 집", floor: -1 });
  assert.deepEqual(forms.roomMetadataFormSchema.parse({ subtitle: " ", floor: "" }),
    { subtitle: null, floor: null });
  assert.equal(forms.roomMetadataFormSchema.parse({ subtitle: "", floor: "0" }).floor, 0);
});

for (const floor of ["1.5", "1e2", "Infinity", "2147483648", "-2147483649", "invalid"]) {
  test(`잘못된 층수 ${floor}를 거부한다`, () => {
    assert.ok(forms.roomMetadataFormSchema);
    assert.equal(forms.roomMetadataFormSchema.safeParse({ subtitle: "", floor }).success, false);
  });
}

test("소제목만 변경하면 추정 층수는 전송하지 않는다", () => {
  assert.ok(forms.buildRoomMetadataPatch);
  assert.deepEqual(forms.buildRoomMetadataPatch({ subtitle: "새 소제목", floor: 3 },
    { subtitle: "이전 소제목", floor: 3 }), { subtitle: "새 소제목" });
  assert.deepEqual(forms.buildRoomMetadataPatch({ subtitle: null, floor: null },
    { subtitle: null, floor: 3 }), { floor: null });
});

test("변경이 없으면 빈 patch로 처리한다", () => {
  assert.ok(forms.buildRoomAddressPatch);
  const values = forms.roomAddressFormSchema.parse(addressInput());
  assert.deepEqual(forms.buildRoomAddressPatch(values, location), {});
  assert.deepEqual(forms.buildRoomMetadataPatch({ subtitle: null, floor: 3 },
    { subtitle: null, floor: 3 }), {});
});

test("기타 유형은 설명 필수이며 다른 유형은 기타 설명을 제거한다", () => {
  assert.ok(forms.roomAddressFormSchema);
  assert.equal(forms.roomAddressFormSchema.safeParse({ ...addressInput(), buildingType: "other" }).success, false);
  assert.equal(forms.roomAddressFormSchema.parse({ ...addressInput(), buildingType: "other", buildingTypeOther: "  원룸 건물  " }).buildingTypeOther, "원룸 건물");
  assert.equal(forms.roomAddressFormSchema.parse({ ...addressInput(), buildingTypeOther: "과거 값" }).buildingTypeOther, null);
  assert.equal(forms.roomAddressFormSchema.safeParse({ ...addressInput(), buildingType: "villa" }).success, false);
});

for (const patch of [
  { legalDongCode: "123" }, { legalDongCode: "11440124000" },
  { latitude: "37.56", longitude: "" }, { latitude: "", longitude: "126.92" },
  { latitude: "91" }, { longitude: "181" }, { latitude: "invalid" },
  { addressRoad: "a".repeat(256) },
]) {
  test(`잘못된 주소·좌표 입력을 거부한다 ${JSON.stringify(patch)}`, () => {
    assert.ok(forms.roomAddressFormSchema);
    assert.equal(forms.roomAddressFormSchema.safeParse({ ...addressInput(), ...patch }).success, false);
  });
}

test("주소를 보정할 때 변경되지 않은 기존 좌표를 재사용하지 않는다", () => {
  assert.ok(forms.buildRoomAddressPatch);
  const values = forms.roomAddressFormSchema.parse({ ...addressInput(), addressRoad: "서울특별시 마포구 성미산로 20" });
  assert.deepEqual(forms.buildRoomAddressPatch(values, location), { addressRoad: "서울특별시 마포구 성미산로 20" });
});

test("좌표 하나를 수정해도 유효한 쌍을 전송하고 둘 다 비우면 null 쌍을 전송한다", () => {
  assert.ok(forms.buildRoomAddressPatch);
  assert.deepEqual(forms.buildRoomAddressPatch(forms.roomAddressFormSchema.parse({ ...addressInput(), latitude: "37.57" }), location),
    { latitude: 37.57, longitude: 126.92 });
  assert.deepEqual(forms.buildRoomAddressPatch(forms.roomAddressFormSchema.parse({ ...addressInput(), latitude: "", longitude: "" }), location),
    { latitude: null, longitude: null });
});

test("주소 확인은 법정동 코드·지역·유효 유형과 일치하는 저장 주소가 있어야 한다", () => {
  assert.ok(forms.canVerifyRoomAddress);
  assert.equal(forms.canVerifyRoomAddress(location), true);
  for (const field of ["sido", "sigungu", "legalDongName", "legalDongCode"] as const) {
    assert.equal(forms.canVerifyRoomAddress({ ...location, [field]: null }), false);
  }
  assert.equal(forms.canVerifyRoomAddress({ ...location, buildingType: "villa" }), false);
  assert.equal(forms.canVerifyRoomAddress({ ...location, addressRoad: "부산광역시 해운대구 도로 10" }), false);
  assert.equal(forms.canVerifyRoomAddress({ ...location, addressRoad: null }), true);
});

test("신규 수정 응답은 roomId와 metadata 필드를 검증한다", () => {
  assert.ok(detail.roomPropertyMutationResponseSchema);
  assert.equal(detail.roomPropertyMutationResponseSchema.safeParse({
    roomId: PROPERTY_ROOM_ID, title: null, subtitle: null, floor: null, addressVerifiedAt: null,
  }).success, true);
  assert.equal(detail.roomPropertyMutationResponseSchema.safeParse({ id: PROPERTY_ROOM_ID }).success, false);
});

test("신규 API 메서드·성공 코드·관리자 권한이 서버와 일치한다", () => {
  for (const [id, method, path] of [
    ["ROM-13", "PATCH", "/admin/rooms/{id}/metadata"],
    ["ROM-14", "PATCH", "/admin/rooms/{id}/address"],
    ["ROM-15", "POST", "/admin/rooms/{id}/address/verify"],
  ]) {
    const operation = ADMIN_OPERATIONS.find((item) => item.id === id);
    assert.ok(operation, `Missing ${id}`);
    assert.equal(operation.method, method);
    assert.equal(operation.path, path);
    assert.equal(operation.successStatus, 200);
    assert.deepEqual(operation.roles, ["room", "super"]);
  }
});
