import "server-only";

import { z } from "zod";

import { AdminApiError } from "@/lib/api/errors";
import { readAdminApi } from "@/lib/api/client";

import {
  notificationLogSchema,
  notificationLogsResponseSchema,
  type NotificationListQuery,
} from "./schemas";

export function notificationApiErrorMessage(error: AdminApiError): string {
  if (error.kind === "http") {
    switch (error.status) {
      case 400:
        return "요청 내용을 확인해 주세요.";
      case 403:
        return "이 알림 로그를 조회할 권한이 없습니다.";
      case 404:
        return "알림 로그를 찾을 수 없습니다.";
      case 409:
        return "다른 변경과 충돌했습니다. 새로고침 후 다시 시도해 주세요.";
      case 422:
        return "요청 형식을 확인해 주세요.";
      default:
        break;
    }
  }
  if (error.kind === "schema") {
    return "알림 로그 응답 형식을 확인할 수 없습니다.";
  }
  return "잠시 후 재시도하세요.";
}

export async function getNotificationLogs(
  query: NotificationListQuery,
): Promise<z.output<typeof notificationLogsResponseSchema>> {
  return readAdminApi({
    operationId: "NOT-01",
    query,
    responseSchema: notificationLogsResponseSchema,
    returnTo: "/notification-logs",
  });
}

export async function getNotificationLog(
  id: string,
): Promise<z.output<typeof notificationLogSchema>> {
  return readAdminApi({
    operationId: "NOT-02",
    pathParameters: { id },
    responseSchema: notificationLogSchema,
    returnTo: `/notification-logs/${id}`,
  });
}
