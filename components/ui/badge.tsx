import type { ReactNode } from "react";

export type BadgeVariant =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "info";

type BadgeProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly variant?: BadgeVariant;
};

const VARIANT_CLASSES = {
  neutral: "border-line bg-surface-muted text-ink",
  accent: "border-brand/20 bg-brand-soft text-brand-soft-ink",
  success: "border-positive/20 bg-positive-soft text-positive",
  warning: "border-caution/20 bg-caution-soft text-caution",
  error: "border-negative/20 bg-negative-soft text-negative",
  info: "border-information/20 bg-information-soft text-information",
} as const satisfies Record<BadgeVariant, string>;

export function Badge({
  children,
  className,
  variant = "neutral",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex min-h-6 max-w-full items-center rounded-full border px-2 text-label font-semibold",
        VARIANT_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="admin-break-anywhere">{children}</span>
    </span>
  );
}
