import "server-only";

import { adminActionFailure, type AdminActionResult } from "@/lib/actions/result";
import type { AdminOperationId } from "@/lib/api/operations";

export const ADMIN_API_ERROR_KINDS = [
  "request",
  "http",
  "timeout",
  "transport",
  "invalidJson",
  "schema",
  "unexpectedStatus",
  "refresh",
  "unexpected",
] as const;

export type AdminApiErrorKind = (typeof ADMIN_API_ERROR_KINDS)[number];

type AdminApiErrorInput = {
  readonly kind: AdminApiErrorKind;
  readonly operationId: AdminOperationId;
  readonly status?: number;
  readonly cause?: Error;
};

const INTERNAL_MESSAGES = {
  request: "The administrator API request is invalid.",
  http: "The administrator API returned an HTTP failure.",
  timeout: "The administrator API request timed out.",
  transport: "The administrator API request failed in transport.",
  invalidJson: "The administrator API response is not valid JSON.",
  schema: "The administrator API response does not match its schema.",
  unexpectedStatus: "The administrator API returned an unexpected success status.",
  refresh: "The administrator session refresh failed.",
  unexpected: "The administrator action failed unexpectedly.",
} as const satisfies Record<AdminApiErrorKind, string>;

export class AdminApiError extends Error {
  readonly name = "AdminApiError";
  readonly kind: AdminApiErrorKind;
  readonly operationId: AdminOperationId;
  readonly status: number | undefined;

  constructor(input: AdminApiErrorInput) {
    super(INTERNAL_MESSAGES[input.kind], { cause: input.cause });
    this.kind = input.kind;
    this.operationId = input.operationId;
    this.status = input.status;
  }
}

const STATUS_ACTION_MESSAGES = {
  400: "요청 내용을 확인해 주세요.",
  401: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
  403: "이 작업을 수행할 권한이 없습니다.",
  404: "대상을 찾을 수 없습니다.",
  409: "다른 변경과 충돌했습니다. 새로고침 후 다시 시도해 주세요.",
  422: "입력값을 확인해 주세요.",
} as const;

export function adminApiFailureResult(error: AdminApiError): AdminActionResult {
  // Upstream bodies and internal causes stay server-side; clients receive stable Korean copy.
  if (error.kind === "http" || error.kind === "refresh") {
    switch (error.status) {
      case 400:
        return adminActionFailure(STATUS_ACTION_MESSAGES[400]);
      case 401:
        return adminActionFailure(STATUS_ACTION_MESSAGES[401]);
      case 403:
        return adminActionFailure(STATUS_ACTION_MESSAGES[403]);
      case 404:
        return adminActionFailure(STATUS_ACTION_MESSAGES[404]);
      case 409:
        return adminActionFailure(STATUS_ACTION_MESSAGES[409]);
      case 422:
        return adminActionFailure(STATUS_ACTION_MESSAGES[422]);
      default:
        break;
    }
  }
  return adminActionFailure("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
}
