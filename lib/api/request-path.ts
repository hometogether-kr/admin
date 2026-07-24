import "server-only";

import { z } from "zod";

import { AdminApiError } from "@/lib/api/errors";
import type { AdminOperation } from "@/lib/api/operations";

export type AdminPathParameters = Readonly<Record<string, string>>;
export type AdminQueryValue = string | number | boolean;
export type AdminQuery = Readonly<
  Record<string, AdminQueryValue | undefined>
>;

const pathParameterSchema = z.uuid();
const queryValueSchema = z.union([
  z.string().max(2_000),
  z.number().finite(),
  z.boolean(),
]);

export function buildAdminOperationPath(
  operation: AdminOperation,
  parameters: AdminPathParameters | undefined,
): string {
  // Exact UUID-key matching prevents leftover placeholders and path traversal input.
  const names = [...operation.path.matchAll(/\{([A-Za-z][A-Za-z0-9]*)\}/gu)]
    .map((match) => match[1])
    .filter((name) => name !== undefined);
  const entries = Object.entries(parameters ?? {});
  const exactNames =
    entries.length === names.length &&
    entries.every(([name]) => names.some((expected) => expected === name));
  if (!exactNames) {
    throw new AdminApiError({ kind: "request", operationId: operation.id });
  }

  let path: string = operation.path;
  for (const name of names) {
    const value = parameters?.[name];
    const parsed = pathParameterSchema.safeParse(value);
    if (!parsed.success) {
      throw new AdminApiError({
        kind: "request",
        operationId: operation.id,
        cause: parsed.error,
      });
    }
    path = path.replace(`{${name}}`, encodeURIComponent(parsed.data));
  }
  return path;
}

export function buildAdminSearchParams(
  operation: AdminOperation,
  query: AdminQuery | undefined,
): URLSearchParams | undefined {
  // Each operation's ledger row is the complete query-key allowlist.
  const entries = Object.entries(query ?? {}).filter((entry) => entry[1] !== undefined);
  if (entries.length === 0) return undefined;

  const searchParams = new URLSearchParams();
  for (const [key, value] of entries) {
    const allowed = operation.query.some((queryKey) => queryKey === key);
    const parsed = queryValueSchema.safeParse(value);
    if (!allowed || !parsed.success) {
      throw new AdminApiError({
        kind: "request",
        operationId: operation.id,
        cause: parsed.success ? undefined : parsed.error,
      });
    }
    searchParams.set(key, String(parsed.data));
  }
  return searchParams;
}
