import "server-only";

import { z } from "zod";

const paginationFields = {
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
} as const;

export function adminTableSchema<ItemSchema extends z.ZodType>(
  itemSchema: ItemSchema,
) {
  return z.array(itemSchema).readonly();
}

export function adminDetailSchema<ItemSchema extends z.ZodType>(
  itemSchema: ItemSchema,
) {
  return itemSchema.nullable();
}

export function adminPaginatedSchema<ItemSchema extends z.ZodType>(
  itemSchema: ItemSchema,
) {
  return z
    .strictObject({
      items: z.array(itemSchema).readonly(),
      ...paginationFields,
      totalPages: z.number().int().nonnegative(),
    })
    .readonly();
}

export function adminSimplePaginatedSchema<ItemSchema extends z.ZodType>(
  itemSchema: ItemSchema,
) {
  return z
    .strictObject({
      items: z.array(itemSchema).readonly(),
      ...paginationFields,
    })
    .readonly();
}
