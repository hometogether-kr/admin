import type { SelectHTMLAttributes } from "react";

import {
  FIELD_CONTROL_CLASS_NAME,
  FieldShell,
  getFieldDescriptionIds,
} from "@/components/ui/field-shell";

export type SelectOption = {
  readonly disabled?: boolean;
  readonly label: string;
  readonly value: string;
};

type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children" | "id"
> & {
  readonly error?: string;
  readonly hint?: string;
  readonly id: string;
  readonly label: string;
  readonly options: readonly SelectOption[];
};

export function Select({
  className,
  error,
  hint,
  id,
  label,
  options,
  required = false,
  ...selectProps
}: SelectProps) {
  return (
    <FieldShell
      error={error}
      hint={hint}
      id={id}
      label={label}
      required={required}
    >
      <select
        {...selectProps}
        aria-describedby={getFieldDescriptionIds(id, hint, error)}
        aria-invalid={Boolean(error)}
        className={[FIELD_CONTROL_CLASS_NAME, className]
          .filter(Boolean)
          .join(" ")}
        id={id}
        required={required}
      >
        {options.map((option) => (
          <option
            disabled={option.disabled}
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
