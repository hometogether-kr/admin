"use server";

import type { AdminActionResult } from "@/lib/actions/result";
import { adminActionFailure } from "@/lib/actions/result";
import { runAdminMutationAction } from "@/lib/actions/mutation";
import {
  reportSchema,
  resolveReportFormSchema,
} from "@/features/reports/schemas";

export async function resolveReportAction(
  _previousResult: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  return runAdminMutationAction("REP-03", ({ mutate }) => {
    const parsed = resolveReportFormSchema.safeParse({
      reportId: formData.get("reportId"),
      status: formData.get("status"),
      memo: formData.get("memo"),
    });
    if (!parsed.success) {
      return adminActionFailure("처리 상태와 메모 길이를 확인해 주세요.");
    }

    const memo = parsed.data.memo.trim();
    return mutate({
      pathParameters: { id: parsed.data.reportId },
      body: {
        status: parsed.data.status,
        ...(memo.length === 0 ? {} : { memo }),
      },
      responseSchema: reportSchema,
      revalidatePaths: ["/reports", `/reports/${parsed.data.reportId}`],
      successMessage: "신고 처리 상태를 저장했습니다.",
    });
  });
}
