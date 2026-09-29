import "server-only";

import { readAdminApi } from "@/lib/api/client";
import {
  hostConsultationListSchema,
  hostConsultationSchema,
  type HostConsultation,
  type HostConsultationList,
} from "@/features/host-consultations/schema";
import {
  hostConsultationListHref,
  type HostConsultationListQuery,
} from "@/features/host-consultations/query-state";

export function readHostConsultations(
  query: HostConsultationListQuery,
): Promise<HostConsultationList> {
  return readAdminApi({
    operationId: "HCR-01",
    query: {
      regionType: query.regionType,
      housingType: query.housingType,
      status: query.status,
      page: query.page,
      limit: query.limit,
    },
    responseSchema: hostConsultationListSchema,
    returnTo: hostConsultationListHref(query, query.page),
  });
}

export function readHostConsultation(id: string): Promise<HostConsultation> {
  return readAdminApi({
    operationId: "HCR-02",
    pathParameters: { id },
    responseSchema: hostConsultationSchema,
    returnTo: `/host-consultations/${id}`,
  });
}
