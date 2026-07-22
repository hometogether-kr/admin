"use client";

import { useActionState, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applySanctionAction } from "@/features/users/actions";
import {
  SANCTION_TYPES,
  sanctionFormSchema,
  type UserId,
} from "@/features/users/contracts";
import { SANCTION_TYPE_LABELS } from "@/features/users/labels";
import { MutationDialog } from "@/features/users/mutation-dialog";
import { INITIAL_ADMIN_ACTION_RESULT } from "@/lib/actions/result";

type SanctionDialogProps = {
  readonly userId: UserId;
};

type SanctionValidation = {
  readonly expiresAt?: string;
  readonly reason?: string;
  readonly reportId?: string;
};

const SANCTION_OPTIONS = SANCTION_TYPES.map((value) => ({
  label: SANCTION_TYPE_LABELS[value],
  value,
}));

function issueFor(
  issues: readonly { readonly message: string; readonly path: readonly PropertyKey[] }[],
  field: keyof SanctionValidation,
): string | undefined {
  return issues.find((issue) => issue.path[0] === field)?.message;
}

export function SanctionDialog({ userId }: SanctionDialogProps) {
  const [validation, setValidation] = useState<SanctionValidation>({});
  const [result, action, pending] = useActionState(
    applySanctionAction,
    INITIAL_ADMIN_ACTION_RESULT,
  );

  function resetValidation(): void {
    setValidation({});
  }

  function validate(formData: FormData): boolean {
    const parsed = sanctionFormSchema.safeParse({
      userId: formData.get("userId"),
      sanctionType: formData.get("sanctionType"),
      reason: formData.get("reason"),
      expiresAt: formData.get("expiresAt"),
      reportId: formData.get("reportId"),
    });
    if (parsed.success) {
      resetValidation();
      return true;
    }
    setValidation({
      expiresAt: issueFor(parsed.error.issues, "expiresAt"),
      reason: issueFor(parsed.error.issues, "reason"),
      reportId: issueFor(parsed.error.issues, "reportId"),
    });
    return false;
  }

  return (
    <MutationDialog
      action={action}
      confirmLabel="제재 적용"
      description="제재 내용을 확인해 적용합니다. 만료일이 없으면 영구 제재입니다."
      id={`apply-sanction-${userId}`}
      onReset={resetValidation}
      onValidate={validate}
      pending={pending}
      result={result}
      title="사용자 제재 적용"
      tone="destructive"
      triggerLabel="제재 적용"
      triggerVariant="secondary"
      userId={userId}
    >
      <input name="userId" type="hidden" value={userId} />
      <Select
        id={`sanction-type-${userId}`}
        label="제재 유형"
        name="sanctionType"
        options={SANCTION_OPTIONS}
        required
      />
      <Textarea
        error={validation.reason}
        hint="5~1,000자로 입력해 주세요."
        id={`sanction-reason-${userId}`}
        label="제재 사유"
        maxLength={1_000}
        minLength={5}
        name="reason"
        required
      />
      <Input
        error={validation.expiresAt}
        hint="미래 날짜·시간만 선택해 주세요."
        id={`sanction-expires-at-${userId}`}
        label="만료일"
        name="expiresAt"
        type="datetime-local"
      />
      <Input
        error={validation.reportId}
        hint="선택 사항입니다. 연관 신고의 UUID를 입력해 주세요."
        id={`sanction-report-id-${userId}`}
        label="신고 ID"
        name="reportId"
        placeholder="00000000-0000-4000-8000-000000000000"
      />
    </MutationDialog>
  );
}
