"use client";

import {
  BellRingingIcon,
  CalendarDotsIcon,
  ChatsCircleIcon,
  CreditCardIcon,
  FileTextIcon,
  FlagIcon,
  HouseLineIcon,
  ListIcon,
  UsersIcon,
  XIcon,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import {
  DesktopNavigation,
  MobileNavigationHeader,
  NavigationList,
} from "@/components/admin/navigation";

const SHELL_MENU_ICONS = {
  users: UsersIcon,
  rooms: HouseLineIcon,
  reservations: CalendarDotsIcon,
  contracts: FileTextIcon,
  payments: CreditCardIcon,
  reports: FlagIcon,
  supports: ChatsCircleIcon,
  notificationLogs: BellRingingIcon,
} as const;

export type ShellNavigationItem = {
  readonly href: string;
  readonly id: keyof typeof SHELL_MENU_ICONS;
  readonly label: string;
};

type ShellNavigationProps = {
  readonly items: readonly ShellNavigationItem[];
};

export function ShellNavigation({ items }: ShellNavigationProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousPathnameRef = useRef(pathname);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const navigationItems = items.map((item) => ({
    href: item.href,
    icon: SHELL_MENU_ICONS[item.id],
    key: item.id,
    label: item.label,
  }));
  const currentHref = items.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  )?.href;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;

    if (!drawerOpen) {
      if (dialog.open) dialog.close();
      return;
    }

    const documentRoot = document.documentElement;
    const previousOverflow = documentRoot.style.overflow;
    if (!dialog.open) dialog.showModal();
    documentRoot.style.overflow = "hidden";

    return () => {
      documentRoot.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) return;
    previousPathnameRef.current = pathname;

    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  }, [pathname]);

  function closeDrawer(): void {
    setDrawerOpen(false);
  }

  function handleDialogClick(event: MouseEvent<HTMLDialogElement>): void {
    if (event.target === event.currentTarget) closeDrawer();
  }

  function handleNavigationClick(event: MouseEvent<HTMLElement>): void {
    if (event.target instanceof Element && event.target.closest("a") !== null) {
      closeDrawer();
    }
  }

  const brand = <span>HomeTogether Admin</span>;

  return (
    <>
      <DesktopNavigation
        currentHref={currentHref}
        header={
          <div className="flex items-center gap-3 text-body font-semibold text-ink-strong">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand-soft-ink">
              <HouseLineIcon
                aria-hidden="true"
                focusable="false"
                size={18}
                weight="fill"
              />
            </span>
            <span className="admin-break-anywhere">HomeTogether Admin</span>
          </div>
        }
        items={navigationItems}
        label="관리자 업무"
      />

      <MobileNavigationHeader
        brand={brand}
        menuTrigger={
          <button
            aria-controls="admin-mobile-drawer"
            aria-expanded={drawerOpen}
            aria-label="관리자 메뉴 열기"
            className="admin-focus admin-interactive flex size-touch items-center justify-center rounded-control border border-line bg-surface text-ink-strong hover:border-line-strong hover:bg-surface-subtle"
            onClick={() => setDrawerOpen(true)}
            ref={triggerRef}
            type="button"
          >
            <ListIcon
              aria-hidden="true"
              focusable="false"
              size={20}
              weight="bold"
            />
          </button>
        }
      />

      <dialog
        aria-labelledby="admin-drawer-title"
        className="admin-drawer fixed inset-y-0 left-0 m-0 h-[100dvb] max-h-none w-[min(var(--ht-sidebar-width),calc(100%-3rem))] max-w-none border-0 border-r border-line-subtle bg-surface p-0 text-ink shadow-dialog backdrop:bg-overlay lg:hidden"
        id="admin-mobile-drawer"
        onCancel={(event) => {
          event.preventDefault();
          closeDrawer();
        }}
        onClick={handleDialogClick}
        onClose={() => {
          setDrawerOpen(false);
          triggerRef.current?.focus();
        }}
        ref={dialogRef}
      >
        <div className="flex h-full min-h-0 flex-col">
          <header className="flex min-h-touch items-center justify-between gap-3 border-b border-line-subtle px-4">
            <h2
              className="admin-keep-words text-body font-semibold text-ink-strong"
              id="admin-drawer-title"
            >
              관리자 메뉴
            </h2>
            <button
              aria-label="관리자 메뉴 닫기"
              autoFocus
              className="admin-focus admin-interactive flex size-touch items-center justify-center rounded-control text-ink hover:bg-surface-muted"
              onClick={closeDrawer}
              type="button"
            >
              <XIcon
                aria-hidden="true"
                focusable="false"
                size={20}
                weight="bold"
              />
            </button>
          </header>
          <nav
            aria-label="모바일 관리자 업무"
            className="min-h-0 flex-1 overflow-y-auto p-3"
            onClick={handleNavigationClick}
          >
            <NavigationList
              currentHref={currentHref}
              items={navigationItems}
            />
          </nav>
        </div>
      </dialog>
    </>
  );
}
