"use client";

import { useActionState, useEffect } from "react";

import { ActionFeedback } from "@/components/admin/action-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateUserAction } from "@/features/users/actions";
import type { AdminUserDetail } from "@/features/users/contracts";
import { completeUserMutation } from "@/features/users/mutation-receipt";
import { INITIAL_ADMIN_ACTION_RESULT } from "@/lib/actions/result";

type UserEditFormProps = {
  readonly user: AdminUserDetail;
};

export function UserEditForm({ user }: UserEditFormProps) {
  const [result, submit, pending] = useActionState(
    updateUserAction,
    INITIAL_ADMIN_ACTION_RESULT,
  );

  useEffect(() => {
    completeUserMutation(user.id, result);
  }, [result, user.id]);

  return (
    <section aria-labelledby="user-edit-title" className="grid gap-4 border-t border-line-subtle pt-6">
      <div className="grid gap-1">
        <h2 className="text-section font-semibold text-ink-strong" id="user-edit-title">
          사용자 정보 수정
        </h2>
        <p className="admin-keep-words text-body text-ink-subtle">
          역할·권한은 유지하고 프로필만 수정합니다.
        </p>
      </div>
      <form action={submit} className="grid gap-4 rounded-panel border border-line-subtle bg-surface p-4 sm:grid-cols-2">
        <input name="userId" type="hidden" value={user.id} />
        <Input defaultValue={user.name ?? ""} id="user-name" label="이름" maxLength={100} name="name" required />
        <Input defaultValue={user.email ?? ""} id="user-email" label="이메일" maxLength={320} name="email" required type="email" />
        <Input defaultValue={user.phone ?? ""} id="user-phone" label="전화번호" name="phone" required type="tel" />
        <Textarea className="sm:col-span-2" defaultValue={user.introduction ?? ""} id="user-introduction" label="자기소개" maxLength={1_000} name="introduction" />
        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <ActionFeedback result={result} />
          <Button loading={pending} type="submit" variant="primary">
            사용자 정보 저장
          </Button>
        </div>
      </form>
    </section>
  );
}
