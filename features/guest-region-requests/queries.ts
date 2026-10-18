import "server-only";
import { readAdminApi } from "@/lib/api/client";
import { guestRegionListHref, type GuestRegionListQuery } from "./query-state";
import {
  guestRegionRequestListSchema,
  type GuestRegionRequestList,
} from "./schema";

export function readGuestRegionRequests(
  query: GuestRegionListQuery,
): Promise<GuestRegionRequestList> {
  return readAdminApi({
    operationId: "GRR-01",
    query: { page: query.page, limit: query.limit },
    responseSchema: guestRegionRequestListSchema,
    returnTo: guestRegionListHref(query, query.page),
  });
}
