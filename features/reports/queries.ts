import "server-only";

import { readAdminApi } from "@/lib/api/client";
import {
  reportListSchema,
  reportSchema,
  type Report,
  type ReportList,
  type ReportListQuery,
} from "@/features/reports/schemas";

export function reportsHref(query: ReportListQuery): string {
  const search = new URLSearchParams({
    limit: String(query.limit),
    page: String(query.page),
  });
  if (query.status !== undefined) search.set("status", query.status);
  if (query.targetType !== undefined) {
    search.set("targetType", query.targetType);
  }
  return `/reports?${search.toString()}`;
}

export async function readReports(query: ReportListQuery): Promise<ReportList> {
  return readAdminApi({
    operationId: "REP-01",
    query: {
      limit: query.limit,
      page: query.page,
      status: query.status,
      targetType: query.targetType,
    },
    responseSchema: reportListSchema,
    returnTo: reportsHref(query),
  });
}

export async function readReport(id: string): Promise<Report> {
  return readAdminApi({
    operationId: "REP-02",
    pathParameters: { id },
    responseSchema: reportSchema,
    returnTo: `/reports/${id}`,
  });
}
