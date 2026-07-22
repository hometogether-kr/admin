import { z } from "zod";

import { clearAdminSession } from "@/lib/auth/session";
import { env } from "@/lib/env";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  Pragma: "no-cache",
} as const;
const allowedOriginSchema = z.literal(new URL(env.ADMIN_PUBLIC_ORIGIN).origin);

export async function POST(request: Request): Promise<Response> {
  const origin = allowedOriginSchema.safeParse(request.headers.get("origin"));
  if (!origin.success) {
    return new Response(null, { status: 403, headers: NO_STORE_HEADERS });
  }

  // The upstream contract has no revocation endpoint; logout invalidates only the BFF cookie.
  await clearAdminSession();
  return new Response(null, {
    status: 303,
    headers: { ...NO_STORE_HEADERS, Location: "/" },
  });
}
