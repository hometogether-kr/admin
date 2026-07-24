"use server";

import type { AdminActionResult } from "@/lib/actions/result";
import { runAdminMutationAction } from "@/lib/actions/mutation";
import { AdminApiError } from "@/lib/api/errors";

import {
  notificationLogIdSchema,
  notificationLogSchema,
} from "./schemas";

export type NotificationResendActionResult =
  | Exclude<AdminActionResult, { readonly kind: "success" }>
  | {
      readonly kind: "success";
      readonly message: string;
      readonly delivery: {
        readonly attempts: number;
        readonly sendStatus: "pending" | "sent" | "failed";
      } | null;
    };

export async function resendNotificationLogAction(
  _previousState: NotificationResendActionResult,
  formData: FormData,
): Promise<NotificationResendActionResult> {
  return runAdminMutationAction("NOT-03", async ({ mutate, read }) => {
    const parsedId = notificationLogIdSchema.safeParse(formData.get("logId"));
    if (!parsedId.success) {
      return { kind: "error", message: "알림 로그를 확인할 수 없습니다." };
    }

    const id = parsedId.data;
    const result = await mutate({
      pathParameters: { id },
      responseSchema: null,
      revalidatePaths: [],
      successMessage: "알림 재전송을 요청했습니다.",
    });

    if (result.kind !== "success") return result;

    try {
      const log = await read({
        operationId: "NOT-02",
        pathParameters: { id },
        responseSchema: notificationLogSchema,
        returnTo: `/notification-logs/${id}`,
      });
      return {
        ...result,
        delivery: { attempts: log.attempts, sendStatus: log.sendStatus },
      };
    } catch (cause) {
      if (cause instanceof AdminApiError) {
        console.error(
          "Failed to load the notification log after a successful resend.",
        );
        return { ...result, delivery: null };
      }
      throw cause;
    }
  });
}
