import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_MENU_ITEMS,
  ADMIN_MENU_REQUEST_HEADER,
} from "@/lib/auth/roles";
import {
  ADMIN_RETURN_TO_REQUEST_HEADER,
  normalizeReturnTo,
} from "@/lib/auth/return-to";

export function proxy(request: NextRequest): NextResponse {
  const rootPath = `/${request.nextUrl.pathname.split("/")[1]}`;
  const menu = ADMIN_MENU_ITEMS.find((item) => item.path === rootPath);
  if (menu === undefined) return NextResponse.next();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(ADMIN_MENU_REQUEST_HEADER, menu.id);
  requestHeaders.set(
    ADMIN_RETURN_TO_REQUEST_HEADER,
    normalizeReturnTo(`${request.nextUrl.pathname}${request.nextUrl.search}`),
  );
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/users/:path*",
    "/rooms/:path*",
    "/reservations/:path*",
    "/contracts/:path*",
    "/payments/:path*",
    "/reports/:path*",
    "/supports/:path*",
    "/notification-logs/:path*",
  ],
};
