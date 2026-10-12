import assert from "node:assert/strict";
import test from "node:test";
import * as forms from "./action-schema";
import { roomDetailSchema } from "./detail-schema";
import { propertyRoomFixture, PROPERTY_ADMIN_ID } from "./test-fixtures/property-room";

function room(status: string, verified = true, isPublic = false) {
  const fixture = propertyRoomFixture();
  return roomDetailSchema.parse({
    ...fixture, roomStatus: status, isPublic,
    data: { ...fixture.data, location: { ...fixture.data.location,
      addressVerifiedAt: verified ? "2026-10-12T00:00:00.000Z" : null,
      addressVerifiedBy: verified ? PROPERTY_ADMIN_ID : null,
    } },
  });
}

for (const status of ["submitted", "inReview", "hidden"]) {
  test(`주소 확인된 ${status} 매물만 게시·재게시할 수 있다`, () => {
    assert.equal(typeof forms.getRoomPublicationState, "function");
    assert.equal(forms.getRoomPublicationState(room(status)).canPublish, true);
    assert.equal(forms.getRoomPublicationState(room(status, false)).canPublish, false);
    assert.equal(forms.getRoomPublicationState(room(status, false)).needsAddressVerification, true);
  });
}

test("숨김 매물의 재게시와 재검토 매물의 공개 중단을 구분해 안내한다", () => {
  assert.equal(typeof forms.getRoomPublicationState, "function");
  assert.equal(forms.getRoomPublicationState(room("hidden")).publishLabel, "재게시");
  assert.match(forms.getRoomPublicationState(room("hidden", false)).notice, /숨김.*주소.*확인/);
  assert.match(forms.getRoomPublicationState(room("inReview", false)).notice, /비공개.*재검토/);
});

test("공개 중인 게시 매물만 숨기며 게시 불가 상태는 활성화하지 않는다", () => {
  assert.equal(typeof forms.getRoomPublicationState, "function");
  assert.equal(forms.getRoomPublicationState(room("published", true, true)).canHide, true);
  for (const status of ["draft", "rejected", "revisionRequested", "published"]) {
    assert.equal(forms.getRoomPublicationState(room(status)).canPublish, false);
    assert.equal(forms.getRoomPublicationState(room(status)).canHide, false);
  }
});

test("확인자가 없거나 필수 주소가 부족하면 확인일이 있어도 게시 버튼을 막는다", () => {
  assert.equal(typeof forms.getRoomPublicationState, "function");
  const fixture = room("hidden");
  if (fixture.registrationContractVersion !== 2) throw new Error("Expected v2");
  for (const patch of [{ addressVerifiedBy: null }, { legalDongCode: null }, { sido: null }, { buildingType: "villa" as const }]) {
    assert.equal(forms.getRoomPublicationState({ ...fixture, data: { ...fixture.data,
      location: { ...fixture.data.location, ...patch },
    } }).canPublish, false);
  }
});
