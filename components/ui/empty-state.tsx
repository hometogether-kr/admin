import { ArchiveIcon } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";

type EmptyStateProps = {
  readonly action?: ReactNode;
  readonly description: string;
  readonly title: string;
};

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <div className="grid justify-items-center gap-3 rounded-panel border border-dashed border-line bg-surface-subtle px-5 py-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-panel border border-line bg-surface text-ink-subtle">
        <ArchiveIcon
          aria-hidden="true"
          focusable="false"
          size={20}
          weight="regular"
        />
      </span>
      <div className="grid max-w-xl gap-1">
        <p className="text-body font-semibold text-ink-strong">{title}</p>
        <p className="admin-keep-words text-body text-ink-subtle">
          {description}
        </p>
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
