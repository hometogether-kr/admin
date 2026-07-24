"use server";

import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";

import {
  adminActionFailure,
  type AdminActionResult,
} from "@/lib/actions/result";
import { runAdminMutationAction } from "@/lib/actions/mutation";
import type { AdminJsonBody } from "@/lib/api/client";
import type { AdminMutationOperationId } from "@/lib/api/operations";
import { supportSchema } from "@/features/supports/schema";

const optionalAdminNoteSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  z
    .string({ error: "관리자 메모를 확인해 주세요." })
    .trim()
    .max(2_000, "관리자 메모는 2,000자 이하로 입력해 주세요.")
    .optional(),
);

const supportActionInputSchema = z
  .strictObject({
    supportId: z.uuid(),
    resolution: z
      .string({ error: "처리 내용을 입력해 주세요." })
      .trim()
      .min(1, "처리 내용을 입력해 주세요.")
      .max(2_000, "처리 내용은 2,000자 이하로 입력해 주세요."),
    adminNote: optionalAdminNoteSchema,
  })
  .readonly();

type SupportMutationInput = {
  readonly operationId: Extract<AdminMutationOperationId, "SUP-03" | "SUP-04">;
  readonly successMessage: string;
  readonly supportId: string;
  readonly formData: FormData;
};

async function mutateSupport(
  input: SupportMutationInput,
): Promise<AdminActionResult> {
  return runAdminMutationAction(input.operationId, ({ mutate }) => {
    const parsed = supportActionInputSchema.safeParse({
      supportId: input.supportId,
      resolution: input.formData.get("resolution"),
      adminNote: input.formData.get("adminNote"),
    });
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      return adminActionFailure(
        fields.resolution?.[0] ??
          fields.adminNote?.[0] ??
          "입력 내용을 확인해 주세요.",
      );
    }

    const body = {
      resolution: parsed.data.resolution,
      ...(parsed.data.adminNote === undefined
        ? {}
        : { adminNote: parsed.data.adminNote }),
    } satisfies AdminJsonBody;

    return mutate({
      pathParameters: { id: parsed.data.supportId },
      body,
      responseSchema: supportSchema,
      revalidatePaths: [
        "/supports",
        `/supports/${parsed.data.supportId}`,
      ],
      successMessage: input.successMessage,
    });
  });
}

export async function resolveSupport(
  supportId: string,
  _previousResult: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const result = await mutateSupport({
    operationId: "SUP-03",
    successMessage: "문의를 해결 처리했습니다.",
    supportId,
    formData,
  });
  if (result.kind === "success") {
    redirect(`/supports/${supportId}?result=resolved`, RedirectType.replace);
  }
  return result;
}

export async function dismissSupport(
  supportId: string,
  _previousResult: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const result = await mutateSupport({
    operationId: "SUP-04",
    successMessage: "문의를 기각 처리했습니다.",
    supportId,
    formData,
  });
  if (result.kind === "success") {
    redirect(`/supports/${supportId}?result=dismissed`, RedirectType.replace);
  }
  return result;
}
