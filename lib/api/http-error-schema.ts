import "server-only";

import { z } from "zod";

export const adminHttpErrorSchema = z
  .strictObject({
    statusCode: z.number().int().min(400).max(599),
    message: z.union([z.string().min(1), z.array(z.string().min(1)).min(1).readonly()]),
    error: z.string().min(1).optional(),
    path: z.string().startsWith("/").min(1),
    timestamp: z.iso.datetime(),
  })
  .readonly();

export type AdminHttpError = z.infer<typeof adminHttpErrorSchema>;
