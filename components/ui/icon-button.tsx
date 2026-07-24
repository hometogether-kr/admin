import { CircleNotchIcon } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { ButtonHTMLAttributes } from "react";

type IconButtonVariant = "neutral" | "destructive";

type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  readonly icon: Icon;
  readonly label: string;
  readonly loading?: boolean;
  readonly variant?: IconButtonVariant;
};

const VARIANT_CLASSES = {
  neutral:
    "border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-subtle active:bg-surface-pressed",
  destructive:
    "border-negative bg-surface text-negative hover:bg-negative-soft active:bg-negative-soft",
} as const satisfies Record<IconButtonVariant, string>;

export function IconButton({
  className,
  disabled = false,
  icon: ButtonIcon,
  label,
  loading = false,
  type = "button",
  variant = "neutral",
  ...buttonProps
}: IconButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...buttonProps}
      aria-busy={loading || undefined}
      aria-label={label}
      className={[
        "admin-focus admin-control admin-interactive inline-flex aspect-square shrink-0 items-center justify-center rounded-control border disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-muted disabled:text-ink-disabled",
        VARIANT_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isDisabled}
      title={label}
      type={type}
    >
      {loading ? (
        <CircleNotchIcon
          aria-hidden="true"
          className="admin-spinner"
          focusable="false"
          size={18}
          weight="bold"
        />
      ) : (
        <ButtonIcon
          aria-hidden="true"
          focusable="false"
          size={18}
          weight="bold"
        />
      )}
    </button>
  );
}
