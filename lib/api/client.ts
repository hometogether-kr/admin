import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  adminActionSuccess,
  type AdminActionResult,
} from "@/lib/actions/result";
import { AdminApiError, adminApiFailureResult } from "@/lib/api/errors";
import type {
  AdminMutationOperationId,
  AdminReadOperationId,
} from "@/lib/api/operations";
import {
  type AdminPathParameters,
  type AdminQuery,
} from "@/lib/api/request-path";
import {
  executeAdminJson,
  executeAdminNoContent,
  type AdminJsonBody,
} from "@/lib/api/transport";
import {
  authorizeAdminSessionForOperation,
  requireAuthorizedAdminSession,
} from "@/lib/auth/authorize";
import { AdminAuthError } from "@/lib/auth/errors";
import { refreshAdminSession } from "@/lib/auth/refresh";
import { normalizeReturnTo } from "@/lib/auth/return-to";
import {
  clearAdminSession,
  commitAdminSession,
} from "@/lib/auth/session";
import type { AdminSessionInput } from "@/lib/auth/session-schema";

export type { AdminJsonBody, AdminJsonValue } from "@/lib/api/transport";

type AdminApiSession = Pick<AdminSessionInput, "adminRole" | "accessToken">;

type AdminRequestBase = {
  readonly pathParameters?: AdminPathParameters;
  readonly query?: AdminQuery;
};

export type AdminReadRequest<Schema extends z.ZodType> = AdminRequestBase & {
  readonly operationId: AdminReadOperationId;
  readonly responseSchema: Schema;
  readonly returnTo: string;
};

export type AdminMutationRequest = AdminRequestBase & {
  readonly operationId: AdminMutationOperationId;
  readonly body?: AdminJsonBody;
  readonly responseSchema: z.ZodType | null;
  readonly revalidatePaths: readonly string[];
  readonly successMessage: string;
};

type AdminMutationExecutionRequest = Omit<
  AdminMutationRequest,
  "operationId"
>;

export type AdminMutationActionContext = {
  readonly mutate: (
    request: AdminMutationExecutionRequest,
  ) => Promise<AdminActionResult>;
  readonly read: <Schema extends z.ZodType>(
    request: AdminReadRequest<Schema>,
  ) => Promise<z.output<Schema>>;
};

function refreshRedirect(returnTo: string): never {
  const search = new URLSearchParams({ returnTo: normalizeReturnTo(returnTo) });
  redirect(`/auth/refresh?${search.toString()}`);
}

// Reads never replay in a Server Component; the refresh route owns cookie rotation.
export async function readAdminApi<Schema extends z.ZodType>(
  request: AdminReadRequest<Schema>,
): Promise<z.output<Schema>> {
  let authorized;
  try {
    authorized = await requireAuthorizedAdminSession(request.operationId);
  } catch (cause) {
    if (cause instanceof AdminAuthError) refreshRedirect(request.returnTo);
    throw cause;
  }
  return readAdminApiWithSession(request, authorized.session);
}

async function readAdminApiWithSession<Schema extends z.ZodType>(
  request: AdminReadRequest<Schema>,
  session: AdminSessionInput,
): Promise<z.output<Schema>> {
  authorizeAdminSessionForOperation(request.operationId, session);
  try {
    return await executeAdminJson({
      request: { ...request, session },
      responseSchema: request.responseSchema,
    });
  } catch (cause) {
    if (cause instanceof AdminApiError && cause.status === 401) {
      refreshRedirect(request.returnTo);
    }
    throw cause;
  }
}

async function executeMutation(
  request: AdminMutationRequest,
  session: AdminApiSession,
): Promise<void> {
  const execution = { ...request, session };
  if (request.responseSchema === null) {
    await executeAdminNoContent(execution);
    return;
  }
  await executeAdminJson({
    request: execution,
    responseSchema: request.responseSchema,
  });
}

function revalidateMutationPaths(
  operationId: AdminMutationOperationId,
  paths: readonly string[],
): void {
  for (const path of paths) {
    if (path.includes("?") || normalizeReturnTo(path) !== path) {
      throw new AdminApiError({ kind: "request", operationId });
    }
    revalidatePath(path);
  }
}

async function clearFailedRefresh(
  request: AdminMutationRequest,
  status: number | undefined,
  cause: Error,
): Promise<AdminActionResult> {
  try {
    await clearAdminSession();
  } catch (clearCause) {
    if (clearCause instanceof Error) {
      return adminApiFailureResult(new AdminApiError({
        kind: "unexpected",
        operationId: request.operationId,
        cause: clearCause,
      }));
    }
    throw clearCause;
  }
  return adminApiFailureResult(new AdminApiError({
    kind: "refresh",
    operationId: request.operationId,
    status,
    cause,
  }));
}

async function refreshAndReplay(
  request: AdminMutationRequest,
): Promise<AdminActionResult> {
  // This helper is called only after the first 401 and performs exactly one replay.
  let refreshed;
  try {
    refreshed = await refreshAdminSession();
  } catch (cause) {
    if (cause instanceof Error) {
      return adminApiFailureResult(new AdminApiError({
        kind: "unexpected",
        operationId: request.operationId,
        cause,
      }));
    }
    throw cause;
  }
  if (!refreshed.ok) {
    return clearFailedRefresh(
      request,
      refreshed.error.upstreamStatus,
      refreshed.error,
    );
  }
  try {
    await commitAdminSession(refreshed.sealedSession);
  } catch (cause) {
    if (cause instanceof Error) {
      return clearFailedRefresh(request, undefined, cause);
    }
    throw cause;
  }
  authorizeAdminSessionForOperation(request.operationId, refreshed.session);
  try {
    await executeMutation(request, refreshed.session);
    revalidateMutationPaths(request.operationId, request.revalidatePaths);
    return adminActionSuccess(request.successMessage);
  } catch (cause) {
    if (cause instanceof AdminApiError) return adminApiFailureResult(cause);
    if (cause instanceof Error) {
      return adminApiFailureResult(new AdminApiError({
        kind: "unexpected",
        operationId: request.operationId,
        cause,
      }));
    }
    throw cause;
  }
}

async function mutateAdminApiWithSession(
  request: AdminMutationRequest,
  session: AdminApiSession,
): Promise<AdminActionResult> {
  try {
    await executeMutation(request, session);
    revalidateMutationPaths(request.operationId, request.revalidatePaths);
    return adminActionSuccess(request.successMessage);
  } catch (cause) {
    if (cause instanceof AdminApiError && cause.status === 401) {
      return refreshAndReplay(request);
    }
    if (cause instanceof AdminApiError) return adminApiFailureResult(cause);
    if (cause instanceof Error) {
      return adminApiFailureResult(new AdminApiError({
        kind: "unexpected",
        operationId: request.operationId,
        cause,
      }));
    }
    throw cause;
  }
}

export function createAdminMutationActionContext(
  operationId: AdminMutationOperationId,
  session: AdminSessionInput,
): AdminMutationActionContext {
  return {
    mutate: (request) =>
      mutateAdminApiWithSession(
        { ...request, operationId },
        session,
      ),
    read: (request) => readAdminApiWithSession(request, session),
  };
}
