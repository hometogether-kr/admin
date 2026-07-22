import type { TextareaHTMLAttributes } from "react";

import {
  FIELD_CONTROL_CLASS_NAME,
  FieldShell,
  getFieldDescriptionIds,
} from "@/components/ui/field-shell";

type TextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id"
> & {
  readonly error?: string;
  readonly hint?: string;
  readonly id: string;
  readonly label: string;
};

export function Textarea({
  className,
  error,
  hint,
  id,
  label,
  required = false,
  rows = 4,
  ...textareaProps
}: TextareaProps) {
  return (
    <FieldShell
      error={error}
      hint={hint}
      id={id}
      label={label}
      required={required}
    >
      <textarea
        {...textareaProps}
        aria-describedby={getFieldDescriptionIds(id, hint, error)}
        aria-invalid={Boolean(error)}
        className={[
          FIELD_CONTROL_CLASS_NAME,
          "min-h-28 resize-y py-2",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        id={id}
        required={required}
        rows={rows}
      />
    </FieldShell>
  );
}
