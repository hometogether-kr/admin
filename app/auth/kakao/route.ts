import {
  localKakaoStateClearCookie,
} from "@/lib/auth/kakao-contract";
import { startKakaoOAuth, type OAuthErrorCode } from "@/lib/auth/oauth";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  Pragma: "no-cache",
} as const;

function failedStart(code: OAuthErrorCode): Response {
  return new Response(null, {
    status: 303,
    headers: {
      ...NO_STORE_HEADERS,
      Location: `/?authError=${code}`,
      "Set-Cookie": localKakaoStateClearCookie(),
    },
  });
}

export async function GET(): Promise<Response> {
  const result = await startKakaoOAuth();
  if (!result.ok) return failedStart(result.error.code);

  return new Response(null, {
    status: 302,
    headers: {
      ...NO_STORE_HEADERS,
      Location: result.location,
      "Set-Cookie": result.stateCookie,
    },
  });
}
