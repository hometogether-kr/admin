import "server-only";

import {
  adminActionFailure,
  type AdminActionError,
  type AdminActionResult,
} from "@/lib/actions/result";
import {
  createAdminMutationActionContext,
  type AdminMutationActionContext,
} from "@/lib/api/client";
import { AdminApiError, adminApiFailureResult } from "@/lib/api/errors";
import type { AdminMutationOperationId } from "@/lib/api/operations";
import { requireAuthorizedAdminSession } from "@/lib/auth/authorize";
import { AdminAuthError } from "@/lib/auth/errors";
import {
  AdminOriginError,
  requireSameOriginMutation,
} from "@/lib/auth/same-origin";

export type { AdminMutationActionContext } from "@/lib/api/client";

type AdminMutationAction<Result extends AdminActionResult> = (
  context: AdminMutationActionContext,
) => Result | Promise<Result>;

export async function runAdminMutationAction<Result extends AdminActionResult>(
  operationId: AdminMutationOperationId,
  action: AdminMutationAction<Result>,
): Promise<Result | AdminActionError> {
  try {
    await requireSameOriginMutation();
  } catch (cause) {
    if (cause instanceof AdminOriginError) {
      return adminActionFailure("요청 출처를 확인할 수 없습니다.");
    }
    if (cause instanceof Error) {
      return adminApiFailureResult(new AdminApiError({
        kind: "unexpected",
        operationId,
        cause,
      }));
    }
    throw cause;
  }

  let authorized;
  try {
    authorized = await requireAuthorizedAdminSession(operationId);
  } catch (cause) {
    if (cause instanceof AdminAuthError) {
      return adminActionFailure("로그인이 필요합니다. 다시 로그인해 주세요.");
    }
    throw cause;
  }

  return action(createAdminMutationActionContext(
    operationId,
    authorized.session,
  ));
}
