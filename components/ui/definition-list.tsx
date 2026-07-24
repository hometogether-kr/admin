import type { ReactNode } from "react";

export type DefinitionItem = {
  readonly label: string;
  readonly value: ReactNode;
};

type DefinitionListProps = {
  readonly items: readonly DefinitionItem[];
};

export function DefinitionList({ items }: DefinitionListProps) {
  return (
    <dl className="divide-y divide-line-subtle overflow-hidden rounded-panel border border-line bg-surface">
      {items.map((item) => (
        <div
          className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(8rem,12rem)_minmax(0,1fr)] sm:gap-4"
          key={item.label}
        >
          <dt className="text-label font-semibold text-ink-subtle">
            {item.label}
          </dt>
          <dd className="admin-break-anywhere m-0 min-w-0 text-body text-ink-strong">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
