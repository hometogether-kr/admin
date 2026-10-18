import assert from "node:assert/strict";
import test from "node:test";
import { roomCoreUpdateFormSchema } from "./action-schema";
import { formatManwon, krwToManwonInput } from "./format";

const input = {
  monthlyRentManwon: "40",
  depositManwon: "100",
  maintenanceFeeManwon: "5.5",
  description: "수정한 설명",
};

test("월세·보증금·관리비를 만원으로 받고 API에는 원 단위 필드만 전달한다", () => {
  assert.deepEqual(roomCoreUpdateFormSchema.parse(input), {
    monthlyRentKrw: 400000,
    depositKrw: 1000000,
    maintenanceFeeKrw: 55000,
    description: "수정한 설명",
  });
});

for (const field of ["depositManwon", "maintenanceFeeManwon"] as const) {
  const outputField =
    field === "depositManwon" ? "depositKrw" : "maintenanceFeeKrw";
  for (const krw of [
    0, 1, 50, 9999, 10000, 55000, 55001, 1000000, 999999999, 1000000000,
  ]) {
    test(`${field}: 기존 ${krw}원을 변경 없이 재저장한다`, () => {
      const parsed = roomCoreUpdateFormSchema.parse({
        ...input,
        [field]: krwToManwonInput(krw),
      });
      assert.equal(parsed[outputField], krw);
    });
  }
  for (const value of [
    "",
    "-1",
    "100000.0001",
    "0.00001",
    "1e2",
    "5만원",
    "50,000",
    "NaN",
    "Infinity",
    null,
  ]) {
    test(`${field}: 유효하지 않은 만원 금액 ${JSON.stringify(value)}를 거절한다`, () => {
      assert.equal(
        roomCoreUpdateFormSchema.safeParse({ ...input, [field]: value })
          .success,
        false,
      );
    });
  }
}

test("구버전 원 단위 보증금·관리비 폼을 만원 입력으로 오인하지 않는다", () => {
  const {
    depositManwon: _deposit,
    maintenanceFeeManwon: _maintenance,
    ...rest
  } = input;
  void _deposit;
  void _maintenance;
  assert.equal(
    roomCoreUpdateFormSchema.safeParse({
      ...rest,
      depositKrw: "1000000",
      maintenanceFeeKrw: "55000",
    }).success,
    false,
  );
});

test("보증금·관리비의 표시도 만원으로 통일하며 소수와 0원을 보존한다", () => {
  assert.equal(formatManwon(1000000), "100만원");
  assert.equal(formatManwon(55000), "5.5만원");
  assert.equal(formatManwon(55001), "5.5001만원");
  assert.equal(formatManwon(1000000000), "100,000만원");
  assert.equal(formatManwon(0), "0만원");
  assert.equal(formatManwon(null), "—");
});
