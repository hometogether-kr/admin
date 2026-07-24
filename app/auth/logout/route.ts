import { AdminAuthError } from "@/lib/auth/errors";
import { hasValidMutationOrigin } from "@/lib/auth/same-origin";
import {
  clearAdminSession,
  requireAdminSession,
} from "@/lib/auth/session";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  Pragma: "no-cache",
} as const;
export async function POST(request: Request): Promise<Response> {
  if (!hasValidMutationOrigin(request.headers)) {
    return new Response(null, { status: 403, headers: NO_STORE_HEADERS });
  }

  try {
    // The session schema admits only the six supported administrative roles.
    await requireAdminSession();
  } catch (cause) {
    if (cause instanceof AdminAuthError) {
      return new Response(null, { status: 401, headers: NO_STORE_HEADERS });
    }
    throw cause;
  }

  // The upstream contract has no revocation endpoint; logout invalidates only the BFF cookie.
  await clearAdminSession();
  return new Response(null, {
    status: 303,
    headers: { ...NO_STORE_HEADERS, Location: "/" },
  });
}
