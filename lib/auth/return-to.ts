import "server-only";

import { z } from "zod";

export const ADMIN_RETURN_TO_REQUEST_HEADER =
  "x-hometogether-admin-return-to";

type ListRouteRule = {
  readonly path: string;
  readonly queryKeys: readonly string[];
};

const LIST_ROUTE_RULES: readonly ListRouteRule[] = [
  { path: "/", queryKeys: [] },
  { path: "/users", queryKeys: [] },
  { path: "/rooms", queryKeys: ["page", "limit", "status", "hostId"] },
  { path: "/reservations", queryKeys: ["status"] },
  { path: "/contracts", queryKeys: [] },
  { path: "/payments", queryKeys: [] },
  { path: "/reports", queryKeys: ["page", "limit", "status", "targetType"] },
  {
    path: "/supports",
    queryKeys: ["status", "inquiryType", "page", "limit"],
  },
  { path: "/notification-logs", queryKeys: ["page", "limit"] },
] as const;

const DETAIL_PATH_PATTERN = /^\/(?:users|rooms|reservations|contracts|payments|reports|supports|notification-logs)\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;
const RAW_UNSAFE_PATTERN = /[\u0000-\u001f\u007f-\u009f\\#@]/u;
const ENCODED_UNSAFE_PATTERN = /%(?:25)*(?:2f|5c|0[0-9a-f]|1[0-9a-f]|[789][0-9a-f]|23|40)/iu;
const MALFORMED_PERCENT_PATTERN = /%(?![0-9a-f]{2})/iu;
const RAW_QUERY_KEY_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/u;
const RAW_QUERY_VALUE_PATTERN = /^[A-Za-z0-9._-]+$/u;
const rawQueryPairSchema = z.tuple([
  z.string().regex(RAW_QUERY_KEY_PATTERN),
  z.string().regex(RAW_QUERY_VALUE_PATTERN),
]);
const returnToInputSchema = z.string();

export function normalizeReturnTo(input: unknown): string {
  const parsedInput = returnToInputSchema.safeParse(input);
  if (
    !parsedInput.success ||
    !parsedInput.data.startsWith("/") ||
    parsedInput.data.startsWith("//") ||
    RAW_UNSAFE_PATTERN.test(parsedInput.data) ||
    ENCODED_UNSAFE_PATTERN.test(parsedInput.data) ||
    MALFORMED_PERCENT_PATTERN.test(parsedInput.data)
  ) {
    return "/";
  }

  const queryStart = parsedInput.data.indexOf("?");
  const pathname =
    queryStart === -1
      ? parsedInput.data
      : parsedInput.data.slice(0, queryStart);
  const rawQuery =
    queryStart === -1 ? "" : parsedInput.data.slice(queryStart + 1);

  if (DETAIL_PATH_PATTERN.test(pathname)) {
    return queryStart === -1 ? pathname : "/";
  }

  const routeRule = LIST_ROUTE_RULES.find((rule) => rule.path === pathname);
  if (routeRule === undefined) {
    return "/";
  }
  if (queryStart === -1) {
    return pathname;
  }
  if (rawQuery.length === 0) {
    return "/";
  }

  // Keep accepted query bytes canonical so normalization is stable on repeat.
  const seenKeys = new Set<string>();
  for (const rawPair of rawQuery.split("&")) {
    const parsedPair = rawQueryPairSchema.safeParse(rawPair.split("="));
    if (!parsedPair.success) {
      return "/";
    }

    const [key] = parsedPair.data;
    if (seenKeys.has(key) || !routeRule.queryKeys.includes(key)) {
      return "/";
    }
    seenKeys.add(key);
  }

  return `${pathname}?${rawQuery}`;
}
