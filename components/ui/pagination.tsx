import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";

type PaginationProps = {
  readonly currentPage: number;
  readonly firstHref?: string;
  readonly lastHref?: string;
  readonly nextHref?: string;
  readonly previousHref?: string;
  readonly totalPages: number;
};

type PaginationControlProps = {
  readonly href?: string;
  readonly icon: Icon;
  readonly label: string;
};

function PaginationControl({ href, icon: ControlIcon, label }: PaginationControlProps) {
  const content = (
    <>
      <ControlIcon
        aria-hidden="true"
        focusable="false"
        size={16}
        weight="bold"
      />
      <span className="sr-only">{label}</span>
    </>
  );
  const className =
    "admin-focus admin-control-sm admin-interactive inline-flex aspect-square items-center justify-center rounded-control border border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-subtle";

  if (href) {
    return (
      <Link aria-label={label} className={className} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <span
      aria-disabled="true"
      aria-label={label}
      className={`${className} cursor-not-allowed bg-surface-muted text-ink-disabled`}
      role="link"
    >
      {content}
    </span>
  );
}

export function Pagination({
  currentPage,
  firstHref,
  lastHref,
  nextHref,
  previousHref,
  totalPages,
}: PaginationProps) {
  return (
    <nav
      aria-label="페이지 이동"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p aria-live="polite" className="text-compact text-ink-subtle">
        <span
          aria-current="page"
          className="font-semibold text-ink-strong"
        >
          {currentPage}
        </span>{" "}
        /{" "}
        {totalPages} 페이지
      </p>
      <div className="flex items-center gap-2">
        <PaginationControl
          href={firstHref}
          icon={CaretDoubleLeftIcon}
          label="첫 페이지"
        />
        <PaginationControl
          href={previousHref}
          icon={CaretLeftIcon}
          label="이전 페이지"
        />
        <PaginationControl
          href={nextHref}
          icon={CaretRightIcon}
          label="다음 페이지"
        />
        <PaginationControl
          href={lastHref}
          icon={CaretDoubleRightIcon}
          label="마지막 페이지"
        />
      </div>
    </nav>
  );
}
