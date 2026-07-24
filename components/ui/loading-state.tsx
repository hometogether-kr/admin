import { CircleNotchIcon } from "@phosphor-icons/react/ssr";

type LoadingStateProps = {
  readonly label?: string;
};

export function LoadingState({ label = "불러오는 중입니다." }: LoadingStateProps) {
  return (
    <div
      aria-live="polite"
      className="flex items-center justify-center gap-3 rounded-panel border border-line bg-surface px-5 py-10 text-body text-ink-subtle"
      role="status"
    >
      <CircleNotchIcon
        aria-hidden="true"
        className="admin-spinner shrink-0 text-brand"
        focusable="false"
        size={20}
        weight="bold"
      />
      <span>{label}</span>
    </div>
  );
}
