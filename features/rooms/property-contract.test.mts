import assert from "node:assert/strict";
import test from "node:test";

import { roomDetailSchema } from "./detail-schema";
import { registrationValueLabel } from "./format";
import { propertyRoomFixture } from "./test-fixtures/property-room";

test("최신 관리자 상세 응답의 제목·구조화 주소·0명 거주자를 읽는다", () => {
  const room = roomDetailSchema.parse(propertyRoomFixture());
  assert.equal(room.registrationContractVersion, 2);
  if (room.registrationContractVersion !== 2) throw new Error("Expected version 2");
  assert.equal(room.title, "마포구 연남동의 오피스텔");
  assert.equal(room.subtitle, "채광 좋은 조용한 집");
  assert.equal(room.data.location.legalDongCode, "1144012400");
  assert.equal(room.data.location.floor, 3);
  assert.equal(room.data.household.residentCount, 0);
  assert.equal(room.data.household.residentType, null);
  assert.equal("privateRoomSize" in room.data.privateSpace, false);
});

for (const [code, label] of [
  ["apartment", "아파트"], ["officetel", "오피스텔"],
  ["shareHouse", "쉐어하우스"], ["detachedHouse", "단독주택"], ["other", "기타"],
] as const) {
  test(`${code} 유형의 관리자 상세와 표시 라벨을 지원한다`, () => {
    const fixture = propertyRoomFixture();
    fixture.data.location.buildingType = code;
    assert.equal(roomDetailSchema.safeParse(fixture).success, true);
    assert.equal(registrationValueLabel(code), label);
  });
}

test("보존된 villa 데이터도 읽어서 유형을 재선택할 수 있다", () => {
  const fixture = propertyRoomFixture();
  fixture.data.location.buildingType = "villa";
  assert.equal(roomDetailSchema.safeParse(fixture).success, true);
});

test("주소·제목이 없고 거주자가 있는 미확인 매물도 읽는다", () => {
  const fixture = propertyRoomFixture();
  const payload = {
    ...fixture, title: null, subtitle: null,
    data: {
      ...fixture.data,
      location: Object.fromEntries(Object.entries(fixture.data.location).map(([key, value]) =>
        [key, ["buildingType", "buildingTypeOther"].includes(key) ? value : null],
      )),
      household: { ...fixture.data.household, residentCount: 2, residentType: "withFamily", residentGenderComposition: "mixed" },
    },
  };
  assert.equal(roomDetailSchema.safeParse(payload).success, true);
});

test("알 수 없는 상세 필드나 잘못된 좌표는 응답 검증에서 거부한다", () => {
  const fixture = propertyRoomFixture();
  assert.equal(roomDetailSchema.safeParse({ ...fixture, accessToken: "private" }).success, false);
  assert.equal(roomDetailSchema.safeParse({
    ...fixture, data: { ...fixture.data, location: { ...fixture.data.location, latitude: "37.56" } },
  }).success, false);
});
