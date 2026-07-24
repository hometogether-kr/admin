import { DefinitionList, type DefinitionItem } from "@/components/ui/definition-list";

type DetailSectionProps = {
  readonly description?: string;
  readonly id: string;
  readonly items: readonly DefinitionItem[];
  readonly title: string;
};

export function DetailSection({ description, id, items, title }: DetailSectionProps) {
  return (
    <section aria-labelledby={id} className="grid gap-3">
      <div className="grid gap-1">
        <h2 className="text-section font-semibold text-ink-strong" id={id}>{title}</h2>
        {description ? <p className="text-body text-ink-subtle">{description}</p> : null}
      </div>
      <DefinitionList items={items} />
    </section>
  );
}
