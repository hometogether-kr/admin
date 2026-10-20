import "server-only";

import { adminActionFailure, type AdminActionError } from "@/lib/actions/result";
import type { AdminOperationId } from "@/lib/api/operations";
import { adminHttpErrorSchema } from "@/lib/api/http-error-schema";

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
  readonly code?: string;
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
  readonly code: string | undefined;

  constructor(input: AdminApiErrorInput) {
    super(INTERNAL_MESSAGES[input.kind], { cause: input.cause });
    this.kind = input.kind;
    this.operationId = input.operationId;
    this.status = input.status;
    this.code = input.code;
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

export async function adminApiStatusError(response: Response, operationId: AdminOperationId): Promise<AdminApiError> {
  let cause: Error | undefined;
  let code: string | undefined;
  try {
    const payload: unknown = await response.json();
    const parsed = adminHttpErrorSchema.safeParse(payload);
    if (!parsed.success) cause = parsed.error;
    else if (parsed.data.statusCode === response.status) code = parsed.data.code;
  } catch (parseCause) {
    if (parseCause instanceof Error) cause = parseCause;
    else throw parseCause;
  }
  return new AdminApiError({
    kind: response.status >= 400 && response.status <= 599 ? "http" : "unexpectedStatus",
    operationId, status: response.status, code, cause,
  });
}

export function adminApiFailureResult(error: AdminApiError): AdminActionError {
  // Upstream bodies and internal causes stay server-side; clients receive stable Korean copy.
  if (error.kind === "http" || error.kind === "refresh") {
    if (error.kind === "http" && (error.status === 400 || error.status === 409)
      && error.operationId.startsWith("ROM-")) {
      switch (error.code) {
        case "ROOM_ADDRESS_VERIFICATION_REQUIRED":
          return adminActionFailure("주소 확인을 완료한 뒤 게시해 주세요.");
        case "ROOM_PUBLICATION_NOT_ALLOWED":
          return adminActionFailure("현재 매물 상태에서는 게시할 수 없습니다. 최신 상태를 확인해 주세요.");
        case "ROOM_HIDE_NOT_ALLOWED":
          return adminActionFailure("공개 중인 게시 매물만 숨길 수 있습니다. 최신 상태를 확인해 주세요.");
        case "ROOM_ADMIN_EDIT_NOT_ALLOWED":
          return adminActionFailure("제출된 등록 계약 v2 매물만 주소·메타데이터를 수정할 수 있습니다.");
        case "ROOM_ADDRESS_INCOMPLETE":
          return adminActionFailure("주소 확인에 필요한 주소·시도·시군구와 건물 유형을 보완해 주세요.");
        case "ROOM_ADDRESS_REGION_MISMATCH":
          return adminActionFailure("도로명 또는 지번 주소와 시도·시군구가 일치하도록 보정해 주세요.");
        case "ROOM_ACTIVE_RESERVATIONS_EXIST":
          return adminActionFailure("활성 예약이 있어 삭제할 수 없습니다. 예약 현황을 확인해 주세요.");
        case "ROOM_DELETION_NOT_ALLOWED":
          return adminActionFailure("작성 중인 매물은 관리자에서 삭제할 수 없습니다. 매물 상태를 확인해 주세요.");
        case "ROOM_LAST_PHOTO_REQUIRED":
          return adminActionFailure("매물 사진은 최소 한 장을 유지해야 합니다. 마지막 사진은 삭제할 수 없습니다.");
      }
    }
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
