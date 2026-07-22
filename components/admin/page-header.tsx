import type { ReactNode } from "react";

type PageHeaderProps = {
  readonly actions?: ReactNode;
  readonly description?: string;
  readonly eyebrow?: ReactNode;
  readonly title: string;
};

export function PageHeader({
  actions,
  description,
  eyebrow,
  title,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-line-subtle pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="grid min-w-0 gap-2">
        {eyebrow ? <div className="text-label text-ink-subtle">{eyebrow}</div> : null}
        <h1 className="admin-keep-words text-page-title font-semibold text-ink-strong">
          {title}
        </h1>
        {description ? (
          <p className="admin-keep-words max-w-3xl text-body text-ink-subtle">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
