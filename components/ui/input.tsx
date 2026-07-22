import type { InputHTMLAttributes } from "react";

import {
  FIELD_CONTROL_CLASS_NAME,
  FieldShell,
  getFieldDescriptionIds,
} from "@/components/ui/field-shell";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "size"> & {
  readonly error?: string;
  readonly hint?: string;
  readonly id: string;
  readonly label: string;
};

export function Input({
  className,
  error,
  hint,
  id,
  label,
  required = false,
  ...inputProps
}: InputProps) {
  return (
    <FieldShell
      error={error}
      hint={hint}
      id={id}
      label={label}
      required={required}
    >
      <input
        {...inputProps}
        aria-describedby={getFieldDescriptionIds(id, hint, error)}
        aria-invalid={Boolean(error)}
        className={[FIELD_CONTROL_CLASS_NAME, className]
          .filter(Boolean)
          .join(" ")}
        id={id}
        required={required}
      />
    </FieldShell>
  );
}
