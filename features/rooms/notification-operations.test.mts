import assert from "node:assert/strict";
import test from "node:test";
import { notificationTemplateSchema } from "./action-schema";

test("재제출 기능이 없는 수정 요청 알림은 관리자 재전송 대상에서 제외한다", () => {
  assert.equal(notificationTemplateSchema.safeParse("roomRevisionRequested").success, false);
  assert.equal(notificationTemplateSchema.safeParse("roomApproved").success, true);
  assert.equal(notificationTemplateSchema.safeParse("roomRejected").success, true);
});
