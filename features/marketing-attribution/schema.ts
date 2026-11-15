import { z } from "zod";

export const hostFlyerAttributionSchema = z.strictObject({
  utm_source: z.literal("apartment_flyer"),
  utm_medium: z.literal("print"),
  utm_campaign: z.literal("host_a4_202611"),
  utm_content: z.string().regex(/^(general|apt[0-9]{3,6}|flyer_v[1-9][0-9]{0,2})$/),
  landing_path: z.literal("/intro/host"),
  first_landed_at: z.iso.datetime(),
}).readonly();

export type HostFlyerAttribution = z.infer<typeof hostFlyerAttributionSchema>;
