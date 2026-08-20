import "server-only";

import { forbidden } from "next/navigation";

import {
  ADMIN_OPERATIONS,
  type AdminRole,
  type AdminOperation,
  type AdminOperationId,
} from "@/lib/api/operations";
import { requireAdminSession } from "@/lib/auth/session";
import type { AdminSessionPayload } from "@/lib/auth/session-schema";

class AdminOperationConfigurationError extends Error {
  readonly name = "AdminOperationConfigurationError";

  constructor(options?: ErrorOptions) {
    super("The administrator operation is not configured.", options);
  }
}

export function getAdminOperation(operationId: AdminOperationId): AdminOperation {
  const operation = ADMIN_OPERATIONS.find((item) => item.id === operationId);
  if (operation === undefined) {
    throw new AdminOperationConfigurationError();
  }
  return operation;
}

export function authorizeAdminSessionForOperation(
  operationId: AdminOperationId,
  session: { readonly adminRole: AdminRole },
): AdminOperation {
  const operation = getAdminOperation(operationId);
  if (!operation.roles.some((role) => role === session.adminRole)) {
    forbidden();
  }
  return operation;
}

export async function requireAuthorizedAdminSession(
  operationId: AdminOperationId,
): Promise<{
  readonly operation: AdminOperation;
  readonly session: AdminSessionPayload;
}> {
  const session = await requireAdminSession();
  return {
    operation: authorizeAdminSessionForOperation(operationId, session),
    session,
  };
}
