import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import type { ReactNode } from "react";

export type AdminNavigationItem = {
  readonly href: string;
  readonly icon: Icon;
  readonly key: string;
  readonly label: string;
};

type NavigationListProps = {
  readonly currentHref?: string;
  readonly items: readonly AdminNavigationItem[];
};

type DesktopNavigationProps = NavigationListProps & {
  readonly footer?: ReactNode;
  readonly header?: ReactNode;
  readonly label: string;
};

type MobileNavigationHeaderProps = {
  readonly brand: ReactNode;
  readonly menuTrigger: ReactNode;
};

export function NavigationList({
  currentHref,
  items,
}: NavigationListProps) {
  return (
    <ul className="grid list-none gap-1 p-0">
      {items.map((item) => {
        const isCurrent = item.href === currentHref;
        const NavigationIcon = item.icon;

        return (
          <li key={item.key}>
            <Link
              aria-current={isCurrent ? "page" : undefined}
              className={[
                "admin-focus admin-control admin-interactive flex items-center gap-3 rounded-control px-3 text-body font-medium",
                isCurrent
                  ? "bg-brand-soft text-brand-soft-ink"
                  : "text-ink hover:bg-surface-muted hover:text-ink-strong",
              ].join(" ")}
              href={item.href}
            >
              <NavigationIcon
                aria-hidden="true"
                className="shrink-0"
                focusable="false"
                size={18}
                weight={isCurrent ? "fill" : "regular"}
              />
              <span className="admin-break-anywhere">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function DesktopNavigation({
  currentHref,
  footer,
  header,
  items,
  label,
}: DesktopNavigationProps) {
  return (
    <aside className="hidden w-sidebar shrink-0 border-r border-line bg-surface lg:flex lg:flex-col">
      {header ? <div className="border-b border-line-subtle p-4">{header}</div> : null}
      <nav aria-label={label} className="min-h-0 flex-1 overflow-y-auto p-3">
        <NavigationList currentHref={currentHref} items={items} />
      </nav>
      {footer ? <div className="border-t border-line-subtle p-4">{footer}</div> : null}
    </aside>
  );
}

export function MobileNavigationHeader({
  brand,
  menuTrigger,
}: MobileNavigationHeaderProps) {
  return (
    <header className="flex min-h-touch items-center justify-between gap-3 border-b border-line bg-surface px-5 lg:hidden">
      <div className="admin-break-anywhere min-w-0 text-body font-semibold text-ink-strong">
        {brand}
      </div>
      <div className="shrink-0">{menuTrigger}</div>
    </header>
  );
}
