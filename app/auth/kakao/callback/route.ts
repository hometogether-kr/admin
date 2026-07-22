import { NextResponse } from "next/server";

import {
  localKakaoStateClearCookie,
  parseKakaoCallbackRequest,
} from "@/lib/auth/kakao-contract";
import {
  completeKakaoOAuth,
  type OAuthErrorCode,
} from "@/lib/auth/oauth";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/session-cookie";
import type { SealedAdminSession } from "@/lib/auth/session-schema";
import { env } from "@/lib/env";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  Pragma: "no-cache",
} as const;

function callbackRedirect(
  location: string,
  stateClearCookie: string,
  sealedSession?: SealedAdminSession,
): Response | null {
  const response = new NextResponse(null, {
    status: 303,
    headers: {
      ...NO_STORE_HEADERS,
      Location: location,
    },
  });
  if (sealedSession !== undefined) {
    const maxAge = sealedSession.expiresAt - Math.floor(Date.now() / 1_000);
    if (maxAge <= 0 || maxAge > env.ADMIN_SESSION_MAX_AGE_SECONDS) return null;
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE.name,
      value: sealedSession.value,
      ...ADMIN_SESSION_COOKIE.options,
      maxAge,
    });
  }
  response.headers.append("Set-Cookie", stateClearCookie);
  return response;
}

function failedCallback(
  code: OAuthErrorCode,
  stateClearCookie: string,
): Response {
  const response = callbackRedirect(`/?authError=${code}`, stateClearCookie);
  if (response === null) throw new Error("Failed to create callback response.");
  return response;
}

export async function GET(request: Request): Promise<Response> {
  const localClearCookie = localKakaoStateClearCookie();
  const input = parseKakaoCallbackRequest(request);
  if (input === null) {
    return failedCallback("oauth_callback_invalid", localClearCookie);
  }

  const result = await completeKakaoOAuth(input);
  if (!result.ok) {
    return failedCallback(
      result.error.code,
      result.stateClearCookie ?? localClearCookie,
    );
  }

  const response = callbackRedirect(
    result.redirectTo,
    result.stateClearCookie,
    result.sealedSession,
  );
  if (response === null) {
    return failedCallback(
      "oauth_callback_invalid_response",
      result.stateClearCookie,
    );
  }
  return response;
}
