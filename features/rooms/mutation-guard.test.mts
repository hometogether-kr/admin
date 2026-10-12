import assert from "node:assert/strict";
import test from "node:test";
import * as guards from "./mutation-guard";
import type { AdminActionResult } from "@/lib/actions/result";

test("주소 저장 중 확인·게시 요청을 추가로 실행하지 않고 완료 후 다시 허용한다", async () => {
  assert.equal(typeof guards.createRoomMutationGuard, "function");
  const states: boolean[] = [];
  const guard = guards.createRoomMutationGuard((busy) => states.push(busy));
  let finish!: (value: AdminActionResult) => void;
  let calls = 0;
  const first = guard.run(() => new Promise<AdminActionResult>((resolve) => { finish = resolve; }), { kind: "idle" }, new FormData());
  const blocked = await guard.run(async () => { calls++; return { kind: "success", message: "게시" }; }, { kind: "idle" }, new FormData());
  assert.equal(blocked.kind, "error");
  assert.equal(calls, 0);
  finish({ kind: "success", message: "저장" });
  await first;
  await guard.run(async () => { calls++; return { kind: "success", message: "게시" }; }, { kind: "idle" }, new FormData());
  assert.equal(calls, 1);
  assert.deepEqual(states, [true, false, true, false]);
});

test("실패한 작업도 잠금을 해제해 재시도할 수 있다", async () => {
  assert.equal(typeof guards.createRoomMutationGuard, "function");
  const guard = guards.createRoomMutationGuard(() => undefined);
  await assert.rejects(guard.run(async () => { throw new Error("test failure"); }, { kind: "idle" }, new FormData()));
  const result = await guard.run(async () => ({ kind: "success", message: "재시도" }), { kind: "idle" }, new FormData());
  assert.equal(result.kind, "success");
});
