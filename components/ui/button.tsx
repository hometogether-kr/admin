import { CircleNotchIcon } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive";

type ButtonSize = "small" | "default";

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  readonly children: ReactNode;
  readonly icon?: Icon;
  readonly loading?: boolean;
  readonly ref?: Ref<HTMLButtonElement>;
  readonly size?: ButtonSize;
  readonly variant?: ButtonVariant;
};

const VARIANT_CLASSES = {
  primary:
    "border-brand bg-brand text-ink-inverse hover:border-brand-hover hover:bg-brand-hover active:border-brand-pressed active:bg-brand-pressed",
  secondary:
    "border-line bg-surface text-ink-strong hover:border-line-strong hover:bg-surface-subtle active:bg-surface-pressed",
  ghost:
    "border-transparent bg-transparent text-ink hover:bg-surface-muted active:bg-surface-pressed",
  destructive:
    "border-negative bg-negative text-ink-inverse hover:border-negative-hover hover:bg-negative-hover active:opacity-90",
} as const satisfies Record<ButtonVariant, string>;

const SIZE_CLASSES = {
  small: "admin-control-sm px-3",
  default: "admin-control px-4",
} as const satisfies Record<ButtonSize, string>;

export function Button({
  children,
  className,
  disabled = false,
  icon: LeadingIcon,
  loading = false,
  size = "default",
  type = "button",
  variant = "secondary",
  ...buttonProps
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...buttonProps}
      aria-busy={loading || undefined}
      className={[
        "admin-focus admin-interactive inline-flex shrink-0 items-center justify-center gap-2 rounded-control border text-body font-semibold disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-muted disabled:text-ink-disabled disabled:opacity-100",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isDisabled}
      type={type}
    >
      {loading ? (
        <CircleNotchIcon
          aria-hidden="true"
          className="admin-spinner shrink-0"
          focusable="false"
          size={16}
          weight="bold"
        />
      ) : LeadingIcon ? (
        <LeadingIcon
          aria-hidden="true"
          className="shrink-0"
          focusable="false"
          size={16}
          weight="bold"
        />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
