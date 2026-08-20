"use server";

import {
  adminActionFailure,
  type AdminActionResult,
} from "@/lib/actions/result";
import {
  runAdminMutationAction,
  type AdminMutationActionContext,
} from "@/lib/actions/mutation";
import type { AdminJsonBody } from "@/lib/api/client";
import {
  addressHiddenSchema,
  mediaIdSchema,
  memoSchema,
  notificationTemplateSchema,
  reasonSchema,
  revisionMessageSchema,
  roomCoreUpdateFormSchema,
  roomIdSchema,
} from "@/features/rooms/action-schema";
import { roomMutationResponseSchema } from "@/features/rooms/detail-schema";

type MutationInput = {
  readonly body?: AdminJsonBody;
  readonly mediaId?: string;
  readonly roomId: string;
  readonly successMessage: string;
  readonly noContent?: boolean;
};

async function mutateRoom(
  input: MutationInput,
  mutate: AdminMutationActionContext["mutate"],
): Promise<AdminActionResult> {
  const roomId = roomIdSchema.safeParse(input.roomId);
  const mediaId = input.mediaId === undefined
    ? undefined
    : mediaIdSchema.safeParse(input.mediaId);
  if (!roomId.success || (mediaId !== undefined && !mediaId.success)) {
    return adminActionFailure("올바른 방 식별자가 아닙니다.");
  }
  return mutate({
    pathParameters: {
      id: roomId.data,
      ...(mediaId?.success ? { mediaId: mediaId.data } : {}),
    },
    ...(input.body === undefined ? {} : { body: input.body }),
    responseSchema: input.noContent ? null : roomMutationResponseSchema,
    revalidatePaths: [],
    successMessage: input.successMessage,
  });
}

export async function approveRoom(
  roomId: string, _previous: AdminActionResult, _formData: FormData,
): Promise<AdminActionResult> {
  void _previous;
  void _formData;
  return runAdminMutationAction("ROM-03", ({ mutate }) =>
    mutateRoom({ roomId, successMessage: "방을 승인·게시했습니다." }, mutate),
  );
}

export async function updateRoomCore(
  roomId: string, _previous: AdminActionResult, formData: FormData,
): Promise<AdminActionResult> {
  return runAdminMutationAction("ROM-12", ({ mutate }) => {
    const parsed = roomCoreUpdateFormSchema.safeParse({
      monthlyRentKrw: formData.get("monthlyRentKrw"),
      depositKrw: formData.get("depositKrw"),
      maintenanceFeeKrw: formData.get("maintenanceFeeKrw"),
      description: formData.get("description"),
    });
    if (!parsed.success) {
      return adminActionFailure("가격과 설명 입력값을 확인해 주세요.");
    }
    return mutateRoom(
      {
        roomId,
        body: parsed.data,
        successMessage: "방 핵심 정보를 수정했습니다.",
      },
      mutate,
    );
  });
}

export async function rejectRoom(
  roomId: string, _previous: AdminActionResult, formData: FormData,
): Promise<AdminActionResult> {
  return runAdminMutationAction("ROM-04", ({ mutate }) => {
    const reason = reasonSchema.safeParse(formData.get("reason"));
    if (!reason.success) return adminActionFailure("반려 사유를 입력해 주세요.");
    return mutateRoom(
      {
        roomId,
        body: { reason: reason.data },
        successMessage: "방을 반려했습니다.",
      },
      mutate,
    );
  });
}

export async function requestRoomRevision(
  roomId: string, _previous: AdminActionResult, formData: FormData,
): Promise<AdminActionResult> {
  return runAdminMutationAction("ROM-05", ({ mutate }) => {
    const message = revisionMessageSchema.safeParse(formData.get("message"));
    if (!message.success) return adminActionFailure("수정 요청 내용을 입력해 주세요.");
    return mutateRoom(
      {
        roomId,
        body: { message: message.data },
        successMessage: "수정을 요청했습니다.",
      },
      mutate,
    );
  });
}

export async function hideRoom(
  roomId: string, _previous: AdminActionResult, _formData: FormData,
): Promise<AdminActionResult> {
  void _previous;
  void _formData;
  return runAdminMutationAction("ROM-06", ({ mutate }) =>
    mutateRoom({ roomId, successMessage: "방을 숨겼습니다." }, mutate),
  );
}

export async function resendRoomNotification(
  roomId: string, _previous: AdminActionResult, formData: FormData,
): Promise<AdminActionResult> {
  return runAdminMutationAction("ROM-07", ({ mutate }) => {
    const template = notificationTemplateSchema.safeParse(
      formData.get("templateCode"),
    );
    if (!template.success) return adminActionFailure("알림 종류를 선택해 주세요.");
    return mutateRoom(
      {
        roomId,
        body: { templateCode: template.data },
        noContent: true,
        successMessage: "알림을 다시 보냈습니다.",
      },
      mutate,
    );
  });
}

export async function setRoomAddressVisibility(
  roomId: string, _previous: AdminActionResult, formData: FormData,
): Promise<AdminActionResult> {
  return runAdminMutationAction("ROM-08", ({ mutate }) => {
    const hidden = addressHiddenSchema.safeParse(formData.get("hidden"));
    if (!hidden.success) return adminActionFailure("주소 공개 설정을 선택해 주세요.");
    return mutateRoom(
      {
        roomId,
        body: { hidden: hidden.data },
        successMessage: "상세 주소 공개 설정을 변경했습니다.",
      },
      mutate,
    );
  });
}

export async function updateRoomMemo(
  roomId: string, _previous: AdminActionResult, formData: FormData,
): Promise<AdminActionResult> {
  return runAdminMutationAction("ROM-09", ({ mutate }) => {
    const memo = memoSchema.safeParse(formData.get("memo"));
    if (!memo.success) return adminActionFailure("메모는 2,000자 이하로 입력해 주세요.");
    return mutateRoom(
      {
        roomId,
        body: { memo: memo.data },
        successMessage: "내부 메모를 저장했습니다.",
      },
      mutate,
    );
  });
}

export async function deleteRoomMedia(
  roomId: string, mediaId: string, _previous: AdminActionResult, _formData: FormData,
): Promise<AdminActionResult> {
  void _previous;
  void _formData;
  return runAdminMutationAction("ROM-10", ({ mutate }) =>
    mutateRoom(
      {
        roomId,
        mediaId,
        noContent: true,
        successMessage: "미디어를 삭제했습니다.",
      },
      mutate,
    ),
  );
}

export async function deleteRoom(
  roomId: string, _previous: AdminActionResult, _formData: FormData,
): Promise<AdminActionResult> {
  void _previous;
  void _formData;
  return runAdminMutationAction("ROM-11", ({ mutate }) =>
    mutateRoom(
      { roomId, noContent: true, successMessage: "방을 삭제했습니다." },
      mutate,
    ),
  );
}
