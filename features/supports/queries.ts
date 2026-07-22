import "server-only";

import { readAdminApi } from "@/lib/api/client";
import {
  supportListSchema,
  supportSchema,
  type Support,
  type SupportList,
} from "@/features/supports/schema";
import {
  supportListHref,
  type SupportListQuery,
} from "@/features/supports/query-state";

export function readSupports(query: SupportListQuery): Promise<SupportList> {
  return readAdminApi({
    operationId: "SUP-01",
    query: {
      status: query.status,
      inquiryType: query.inquiryType,
      page: query.page,
      limit: query.limit,
    },
    responseSchema: supportListSchema,
    returnTo: supportListHref(query, query.page),
  });
}

export function readSupport(supportId: string): Promise<Support> {
  return readAdminApi({
    operationId: "SUP-02",
    pathParameters: { id: supportId },
    responseSchema: supportSchema,
    returnTo: `/supports/${supportId}`,
  });
}
