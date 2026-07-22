import type { ReactNode } from "react";

type FieldShellProps = {
  readonly children: ReactNode;
  readonly error?: string;
  readonly hint?: string;
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
};

export const FIELD_CONTROL_CLASS_NAME =
  "admin-focus admin-control w-full rounded-control border border-line bg-surface px-3 text-body text-ink-strong shadow-subtle placeholder:text-ink-disabled hover:border-line-strong disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-disabled aria-invalid:border-negative aria-invalid:bg-negative-soft";

export function getFieldDescriptionIds(
  id: string,
  hint?: string,
  error?: string,
): string | undefined {
  if (hint && error) return `${id}-hint ${id}-error`;
  if (hint) return `${id}-hint`;
  if (error) return `${id}-error`;
  return undefined;
}

export function FieldShell({
  children,
  error,
  hint,
  id,
  label,
  required = false,
}: FieldShellProps) {
  return (
    <div className="grid gap-2">
      <label className="text-body font-semibold text-ink-strong" htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-negative">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p className="text-compact text-ink-subtle" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-compact font-medium text-negative" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
