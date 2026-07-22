import { AdminAuthError } from "@/lib/auth/errors";
import { refreshAdminSession } from "@/lib/auth/refresh";
import { normalizeReturnTo } from "@/lib/auth/return-to";
import {
  clearAdminSession,
  commitAdminSession,
} from "@/lib/auth/session";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  Pragma: "no-cache",
} as const;

function redirectResponse(location: string): Response {
  return new Response(null, {
    status: 303,
    headers: { ...NO_STORE_HEADERS, Location: location },
  });
}

function safeReturnTo(request: Request): string {
  const searchParams = new URL(request.url).searchParams;
  const values = searchParams.getAll("returnTo");
  const onlyReturnTo = [...searchParams.keys()].every(
    (key) => key === "returnTo",
  );
  return onlyReturnTo && values.length === 1
    ? normalizeReturnTo(values[0])
    : "/";
}

export async function GET(request: Request): Promise<Response> {
  const returnTo = safeReturnTo(request);
  const result = await refreshAdminSession();
  if (!result.ok) {
    await clearAdminSession();
    return redirectResponse(`/?authError=${result.error.code}`);
  }

  try {
    await commitAdminSession(result.sealedSession);
  } catch (cause) {
    if (cause instanceof AdminAuthError) {
      await clearAdminSession();
      return redirectResponse("/?authError=refresh_response_invalid");
    }
    throw cause;
  }
  return redirectResponse(returnTo);
}
