"use server";

import { z } from "zod";

import {
  adminActionFailure,
  type AdminActionResult,
} from "@/lib/actions/result";
import { runAdminMutationAction } from "@/lib/actions/mutation";

import {
  isTerminalReservationStatus,
} from "@/features/reservations/constants";
import {
  notificationTemplateSchema,
  reservationIdSchema,
  reservationSchema,
  reservationStatusSchema,
} from "@/features/reservations/schemas";

const optionalNoteSchema = z.preprocess(
  (value: unknown) => (value === null || value === "" ? undefined : value),
  z.string().trim().max(10_000).optional(),
);

const statusFormSchema = z.strictObject({
  status: reservationStatusSchema,
  note: optionalNoteSchema,
  confirmTerminal: z.preprocess(
    (value: unknown) => value === "true",
    z.boolean(),
  ),
});

const notificationFormSchema = z.strictObject({
  templateCode: notificationTemplateSchema,
});

export async function updateReservationStatus(
  reservationId: string,
  previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  void previousState;
  return runAdminMutationAction("RES-03", ({ mutate }) => {
    const parsedId = reservationIdSchema.safeParse(reservationId);
    const parsedForm = statusFormSchema.safeParse({
      status: formData.get("status"),
      note: formData.get("note"),
      confirmTerminal: formData.get("confirmTerminal"),
    });
    if (!parsedId.success || !parsedForm.success) {
      return adminActionFailure("상태 변경 내용을 확인해 주세요.");
    }
    if (
      isTerminalReservationStatus(parsedForm.data.status) &&
      !parsedForm.data.confirmTerminal
    ) {
      return adminActionFailure("종료 상태로 변경하려면 확인이 필요합니다.");
    }

    const body = {
      status: parsedForm.data.status,
      ...(parsedForm.data.note === undefined
        ? {}
        : { note: parsedForm.data.note }),
    };
    return mutate({
      pathParameters: { id: parsedId.data },
      body,
      responseSchema: reservationSchema,
      revalidatePaths: [],
      successMessage: "예약 상태를 업데이트했습니다.",
    });
  });
}

export async function resendReservationNotification(
  reservationId: string,
  previousState: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  void previousState;
  return runAdminMutationAction("RES-04", ({ mutate }) => {
    const parsedId = reservationIdSchema.safeParse(reservationId);
    const parsedForm = notificationFormSchema.safeParse({
      templateCode: formData.get("templateCode"),
    });
    if (!parsedId.success || !parsedForm.success) {
      return adminActionFailure("알림 템플릿을 선택해 주세요.");
    }

    return mutate({
      pathParameters: { id: parsedId.data },
      body: { templateCode: parsedForm.data.templateCode },
      responseSchema: null,
      revalidatePaths: [],
      successMessage: "예약 알림을 재발송했습니다.",
    });
  });
}
