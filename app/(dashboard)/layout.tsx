import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import type { ReactNode } from "react";

import {
  ShellNavigation,
  type ShellNavigationItem,
} from "@/components/admin/shell-navigation";
import { Button } from "@/components/ui/button";
import {
  ADMIN_MENU_ITEMS,
  ADMIN_MENU_REQUEST_HEADER,
  ADMIN_ROLE_LABELS,
  ADMIN_ROLE_MENUS,
  roleCanAccessMenu,
} from "@/lib/auth/roles";
import {
  ADMIN_RETURN_TO_REQUEST_HEADER,
  normalizeReturnTo,
} from "@/lib/auth/return-to";
import { readAdminSession } from "@/lib/auth/session";

type DashboardLayoutProps = {
  readonly children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const requestHeaders = await headers();
  const sessionResult = await readAdminSession();
  switch (sessionResult.kind) {
    case "valid":
      break;
    case "missing":
      redirect("/");
    case "invalid":
    case "expired": {
      const returnTo = normalizeReturnTo(
        requestHeaders.get(ADMIN_RETURN_TO_REQUEST_HEADER),
      );
      redirect(`/auth/refresh?${new URLSearchParams({ returnTo })}`);
    }
    default:
      sessionResult satisfies never;
  }

  const { displayName, role } = sessionResult.session;
  const requestedMenuId = requestHeaders.get(ADMIN_MENU_REQUEST_HEADER);
  const requestedMenu = ADMIN_MENU_ITEMS.find(
    (item) => item.id === requestedMenuId,
  );
  if (
    requestedMenu !== undefined &&
    !roleCanAccessMenu(role, requestedMenu.id)
  ) {
    forbidden();
  }

  const allowedMenuIds = ADMIN_ROLE_MENUS[role];
  const navigationItems: readonly ShellNavigationItem[] = ADMIN_MENU_ITEMS
    .filter((item) => allowedMenuIds.some((menuId) => menuId === item.id))
    .map((item) => ({ href: item.path, id: item.id, label: item.label }));
  const safeDisplayName = displayName?.trim().slice(0, 40) || "관리자";

  return (
    <>
      <a
        className="admin-focus admin-interactive fixed left-4 top-4 z-50 -translate-y-20 rounded-control bg-brand px-4 py-3 text-body font-semibold text-ink-inverse focus:translate-y-0"
        href="#admin-main"
      >
        본문으로 건너뛰기
      </a>
      <div className="fixed inset-0 grid h-[100dvb] min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-canvas lg:grid-cols-[auto_minmax(0,1fr)] lg:grid-rows-1">
        <ShellNavigation items={navigationItems} />
        <div className="flex min-h-0 min-w-0 flex-col">
          <header className="flex min-h-touch shrink-0 items-center justify-between gap-4 border-b border-line-subtle bg-surface px-5 py-2 sm:px-6">
            <div className="grid min-w-0 gap-0.5">
              <span className="truncate text-body font-semibold text-ink-strong">
                {safeDisplayName}
              </span>
              <span className="text-label text-ink-subtle">
                {ADMIN_ROLE_LABELS[role]}
              </span>
            </div>
            <form action="/auth/logout" method="post">
              <Button size="small" type="submit" variant="ghost">
                로그아웃
              </Button>
            </form>
          </header>
          <main
            className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-6"
            id="admin-main"
            tabIndex={-1}
          >
            <div className="mx-auto w-full max-w-content">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
