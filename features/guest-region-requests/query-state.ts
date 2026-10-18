import { z } from "zod";

export type GuestRegionSearchParams = Readonly<
  Record<string, string | readonly string[] | undefined>
>;
export type GuestRegionListQuery = {
  readonly page: number;
  readonly limit: number;
};

const positiveInteger = z
  .string()
  .regex(/^[1-9][0-9]*$/u)
  .transform(Number)
  .pipe(z.number().safe().int().positive());
const querySchema = z.strictObject({
  page: positiveInteger.catch(1),
  limit: positiveInteger.pipe(z.number().max(100)).catch(20),
});

export function parseGuestRegionListQuery(
  params: GuestRegionSearchParams,
): GuestRegionListQuery {
  return querySchema.parse({ page: params.page, limit: params.limit });
}

export function guestRegionListHref(
  query: GuestRegionListQuery,
  page: number,
): string {
  return `/guest-region-requests?${new URLSearchParams({ page: String(page), limit: String(query.limit) })}`;
}

export function guestRegionCanonicalPage(
  page: number,
  totalPages: number,
): number {
  return Math.min(page, Math.max(1, totalPages));
}
