import assert from "node:assert/strict";
import test from "node:test";
import { memoSchema } from "./action-schema";

test("폼에서 메모가 누락되면 삭제 요청으로 변환하지 않는다", () => {
  assert.equal(memoSchema.safeParse(new FormData().get("memo")).success, false);
  assert.equal(memoSchema.safeParse(undefined).success, false);
});

test("명시적으로 입력한 빈 메모는 삭제하고 입력한 메모는 trim한다", () => {
  assert.equal(memoSchema.parse("  "), null);
  assert.equal(memoSchema.parse("  현장 확인 완료  "), "현장 확인 완료");
});
