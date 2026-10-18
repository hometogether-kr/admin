import assert from "node:assert/strict";
import test from "node:test";
import { roomCoreUpdateFormSchema } from "./action-schema";
import { formatManwon, krwToManwonInput } from "./format";

const coreInput = {
  depositManwon: "1000", maintenanceFeeManwon: "5", description: "수정한 설명",
};

for (const [monthlyRentManwon, monthlyRentKrw] of [
  ["50", 500000], ["50.5", 505000], ["50.0001", 500001], ["0.0001", 1], ["10000", 100000000],
] as const) {
  test(`월세 ${monthlyRentManwon}만원을 API 원 단위 ${monthlyRentKrw}로 변환한다`, () => {
    assert.deepEqual(roomCoreUpdateFormSchema.parse({ ...coreInput, monthlyRentManwon }), {
      monthlyRentKrw, depositKrw: 10000000, maintenanceFeeKrw: 50000, description: "수정한 설명",
    });
  });
}

for (const monthlyRentManwon of ["", "0", "-1", "10000.0001", "0.00001", "1e2", "50만원", "50,000", "NaN", "Infinity"]) {
  test(`잘못된 월세 만원 입력 ${JSON.stringify(monthlyRentManwon)}을 거부한다`, () => {
    assert.equal(roomCoreUpdateFormSchema.safeParse({ ...coreInput, monthlyRentManwon }).success, false);
  });
}

test("이전 원 단위 폼 값을 만원으로 오인해 저장하지 않는다", () => {
  assert.equal(roomCoreUpdateFormSchema.safeParse({ ...coreInput, monthlyRentKrw: "500000" }).success, false);
});

for (const krw of [1, 50, 9999, 10000, 500000, 500001, 505000, 99999999, 100000000]) {
  test(`기존 ${krw}원 월세를 변경 없이 다시 저장해도 금액이 유지된다`, () => {
    const input = krwToManwonInput(krw);
    assert.equal(roomCoreUpdateFormSchema.parse({ ...coreInput, monthlyRentManwon: input }).monthlyRentKrw, krw);
  });
}

test("월세를 만원 단위로 표시하며 누락값과 0원을 구분한다", () => {
  assert.equal(formatManwon(500000), "50만원");
  assert.equal(formatManwon(505000), "50.5만원");
  assert.equal(formatManwon(500001), "50.0001만원");
  assert.equal(formatManwon(100000000), "10,000만원");
  assert.equal(formatManwon(0), "0만원");
  assert.equal(formatManwon(null), "—");
  assert.equal(krwToManwonInput(null), "");
});
