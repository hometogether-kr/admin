import {
  CheckCircleIcon,
  InfoIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export type AlertVariant = "success" | "warning" | "error" | "info";

type AlertProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly title?: string;
  readonly variant?: AlertVariant;
};

const VARIANT_CLASSES = {
  success: "border-positive/25 bg-positive-soft text-positive",
  warning: "border-caution/25 bg-caution-soft text-caution",
  error: "border-negative/25 bg-negative-soft text-negative",
  info: "border-information/25 bg-information-soft text-information",
} as const satisfies Record<AlertVariant, string>;

const VARIANT_ICONS = {
  success: CheckCircleIcon,
  warning: WarningCircleIcon,
  error: XCircleIcon,
  info: InfoIcon,
} as const satisfies Record<AlertVariant, Icon>;

export function Alert({
  children,
  className,
  title,
  variant = "info",
}: AlertProps) {
  const StatusIcon = VARIANT_ICONS[variant];

  return (
    <div
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={[
        "flex items-start gap-3 rounded-panel border p-3 text-body",
        VARIANT_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role={variant === "error" ? "alert" : "status"}
    >
      <StatusIcon
        aria-hidden="true"
        className="mt-0.5 shrink-0"
        focusable="false"
        size={18}
        weight="fill"
      />
      <div className="admin-keep-words grid min-w-0 gap-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="text-ink">{children}</div>
      </div>
    </div>
  );
}
