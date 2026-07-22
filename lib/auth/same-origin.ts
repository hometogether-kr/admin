import "server-only";

import { headers } from "next/headers";
import { z } from "zod";

import { env } from "@/lib/env";

const mutationOriginSchema = z.literal(new URL(env.ADMIN_PUBLIC_ORIGIN).origin);

export class AdminOriginError extends Error {
  readonly name = "AdminOriginError";

  constructor(options?: ErrorOptions) {
    super("The mutation origin is not allowed.", options);
  }
}

export function hasValidMutationOrigin(requestHeaders: Headers): boolean {
  return mutationOriginSchema.safeParse(requestHeaders.get("origin")).success;
}

export function assertMutationOrigin(requestHeaders: Headers): void {
  const parsed = mutationOriginSchema.safeParse(requestHeaders.get("origin"));
  if (!parsed.success) {
    throw new AdminOriginError({ cause: parsed.error });
  }
}

export async function requireSameOriginMutation(): Promise<void> {
  assertMutationOrigin(await headers());
}
