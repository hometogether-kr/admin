"use server";

import {
  adminActionFailure,
  type AdminActionResult,
} from "@/lib/actions/result";
import { mutateAdminApi, type AdminJsonBody } from "@/lib/api/client";
import { AdminApiError, adminApiFailureResult } from "@/lib/api/errors";
import type { AdminMutationOperationId } from "@/lib/api/operations";
import { requireAuthorizedAdminSession } from "@/lib/auth/authorize";
import { AdminAuthError } from "@/lib/auth/errors";
import {
  AdminOriginError,
  requireSameOriginMutation,
} from "@/lib/auth/same-origin";
import {
  disablementResponseSchema,
  sanctionFormSchema,
  sanctionSchema,
  studentProfileSchema,
  studentRejectionFormSchema,
  userMutationFormSchema,
  type UserId,
} from "@/features/users/contracts";
import { getUser } from "@/features/users/queries";

async function validateActionBoundary(
  operationId: AdminMutationOperationId,
): Promise<AdminActionResult | null> {
  try {
    await requireSameOriginMutation();
  } catch (cause) {
    if (cause instanceof AdminOriginError) {
      return adminActionFailure("요청 출처를 확인할 수 없습니다.");
    }
    throw cause;
  }

  try {
    await requireAuthorizedAdminSession(operationId);
    return null;
  } catch (cause) {
    if (cause instanceof AdminAuthError) {
      return adminActionFailure("로그인이 필요합니다. 다시 로그인해 주세요.");
    }
    throw cause;
  }
}

async function validateStudentTarget(
  userId: UserId,
): Promise<AdminActionResult | null> {
  let user;
  try {
    user = await getUser(userId);
  } catch (cause) {
    if (cause instanceof AdminApiError) return adminApiFailureResult(cause);
    throw cause;
  }

  if (user === null) return adminActionFailure("대상을 찾을 수 없습니다.");
  if (user.role !== "student") {
    return adminActionFailure("학생 사용자에게만 인증 작업을 수행할 수 있습니다.");
  }
  return null;
}

export async function disableUserAction(
  _previousResult: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const operationId = "USR-03" as const;
  const boundaryFailure = await validateActionBoundary(operationId);
  if (boundaryFailure !== null) return boundaryFailure;

  const parsed = userMutationFormSchema.safeParse({
    userId: formData.get("userId"),
  });
  if (!parsed.success) return adminActionFailure("사용자 ID를 확인해 주세요.");

  return mutateAdminApi({
    operationId,
    pathParameters: { id: parsed.data.userId },
    responseSchema: disablementResponseSchema,
    revalidatePaths: [],
    successMessage: "사용자를 비활성화했습니다.",
  });
}

export async function applySanctionAction(
  _previousResult: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const operationId = "USR-05" as const;
  const boundaryFailure = await validateActionBoundary(operationId);
  if (boundaryFailure !== null) return boundaryFailure;

  const parsed = sanctionFormSchema.safeParse({
    userId: formData.get("userId"),
    sanctionType: formData.get("sanctionType"),
    reason: formData.get("reason"),
    expiresAt: formData.get("expiresAt"),
    reportId: formData.get("reportId"),
  });
  if (!parsed.success) return adminActionFailure("제재 입력값을 확인해 주세요.");

  const body: AdminJsonBody = {
    sanctionType: parsed.data.sanctionType,
    reason: parsed.data.reason,
    ...(parsed.data.expiresAt === undefined
      ? {}
      : { expiresAt: parsed.data.expiresAt }),
    ...(parsed.data.reportId === undefined
      ? {}
      : { reportId: parsed.data.reportId }),
  };
  return mutateAdminApi({
    operationId,
    body,
    pathParameters: { id: parsed.data.userId },
    responseSchema: sanctionSchema,
    revalidatePaths: [],
    successMessage: "제재를 적용했습니다.",
  });
}

export async function approveStudentAction(
  _previousResult: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const operationId = "USR-06" as const;
  const boundaryFailure = await validateActionBoundary(operationId);
  if (boundaryFailure !== null) return boundaryFailure;

  const parsed = userMutationFormSchema.safeParse({
    userId: formData.get("userId"),
  });
  if (!parsed.success) return adminActionFailure("사용자 ID를 확인해 주세요.");

  const targetFailure = await validateStudentTarget(parsed.data.userId);
  if (targetFailure !== null) return targetFailure;
  return mutateAdminApi({
    operationId,
    pathParameters: { id: parsed.data.userId },
    responseSchema: studentProfileSchema,
    revalidatePaths: [],
    successMessage: "학생 인증을 승인했습니다.",
  });
}

export async function rejectStudentAction(
  _previousResult: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const operationId = "USR-07" as const;
  const boundaryFailure = await validateActionBoundary(operationId);
  if (boundaryFailure !== null) return boundaryFailure;

  const parsed = studentRejectionFormSchema.safeParse({
    userId: formData.get("userId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return adminActionFailure("반려 사유를 입력해 주세요.");

  const targetFailure = await validateStudentTarget(parsed.data.userId);
  if (targetFailure !== null) return targetFailure;
  return mutateAdminApi({
    operationId,
    body: { reason: parsed.data.reason },
    pathParameters: { id: parsed.data.userId },
    responseSchema: studentProfileSchema,
    revalidatePaths: [],
    successMessage: "학생 인증을 반려했습니다.",
  });
}
