import type { ReactNode } from "react";

type RouteStateProps = {
  readonly action?: ReactNode;
  readonly code: string;
  readonly description: string;
  readonly title: string;
};

export function RouteState({ action, code, description, title }: RouteStateProps) {
  return (
    <section
      aria-labelledby="route-state-title"
      className="grid min-h-[60dvb] flex-1 place-items-center px-5 py-10"
    >
      <div className="grid w-full max-w-lg justify-items-center gap-4 rounded-panel border border-line-subtle bg-surface p-6 text-center sm:p-8">
        <p className="font-mono text-label font-semibold text-brand-soft-ink">
          {code}
        </p>
        <div className="grid gap-2">
          <h1
            className="admin-keep-words text-page-title font-semibold text-ink-strong"
            id="route-state-title"
          >
            {title}
          </h1>
          <p className="admin-keep-words text-body text-ink-subtle">
            {description}
          </p>
        </div>
        {action ? <div className="mt-1">{action}</div> : null}
      </div>
    </section>
  );
}
