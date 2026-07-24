"use client";

import { useActionState, useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { rejectStudentAction } from "@/features/users/actions";
import {
  studentRejectionFormSchema,
  type UserId,
} from "@/features/users/contracts";
import { MutationDialog } from "@/features/users/mutation-dialog";
import { INITIAL_ADMIN_ACTION_RESULT } from "@/lib/actions/result";

type RejectionDialogProps = {
  readonly userId: UserId;
};

export function RejectionDialog({ userId }: RejectionDialogProps) {
  const [reasonError, setReasonError] = useState<string>();
  const [result, action, pending] = useActionState(
    rejectStudentAction,
    INITIAL_ADMIN_ACTION_RESULT,
  );

  function resetValidation(): void {
    setReasonError(undefined);
  }

  function validate(formData: FormData): boolean {
    const parsed = studentRejectionFormSchema.safeParse({
      userId: formData.get("userId"),
      reason: formData.get("reason"),
    });
    if (parsed.success) {
      resetValidation();
      return true;
    }
    setReasonError(
      parsed.error.issues.find((issue) => issue.path[0] === "reason")?.message ??
        "반려 사유를 확인해 주세요.",
    );
    return false;
  }

  return (
    <MutationDialog
      action={action}
      confirmLabel="반려 확정"
      description="학생 인증 반려 사유를 입력해 주세요."
      id={`reject-student-${userId}`}
      onReset={resetValidation}
      onValidate={validate}
      pending={pending}
      result={result}
      title="학생 인증 반려"
      triggerLabel="인증 반려"
      triggerVariant="secondary"
      userId={userId}
    >
      <input name="userId" type="hidden" value={userId} />
      <Textarea
        error={reasonError}
        id={`rejection-reason-${userId}`}
        label="반려 사유"
        name="reason"
        required
      />
    </MutationDialog>
  );
}
