import "server-only";

import { readAdminApi } from "@/lib/api/client";
import {
  adminUserListSchema,
  adminUserDetailSchema,
  sanctionListSchema,
  type AdminUserDetail,
  type AdminUserSummary,
  type Sanction,
  type UserId,
} from "@/features/users/contracts";

export async function getUsers(): Promise<readonly AdminUserSummary[]> {
  const operationId = "USR-01" as const;
  return readAdminApi({
    operationId,
    responseSchema: adminUserListSchema,
    returnTo: "/users",
  });
}

export async function getUser(
  userId: UserId,
): Promise<AdminUserDetail> {
  const operationId = "USR-02" as const;
  return readAdminApi({
    operationId,
    pathParameters: { id: userId },
    responseSchema: adminUserDetailSchema,
    returnTo: `/users/${userId}`,
  });
}

export async function getUserSanctions(
  userId: UserId,
): Promise<readonly Sanction[]> {
  const operationId = "USR-04" as const;
  return readAdminApi({
    operationId,
    pathParameters: { id: userId },
    responseSchema: sanctionListSchema,
    returnTo: `/users/${userId}`,
  });
}
