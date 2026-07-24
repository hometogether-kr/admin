import { Badge } from "@/components/ui/badge";
import { DefinitionList } from "@/components/ui/definition-list";
import type { AdminUserSummary } from "@/features/users/contracts";
import { CopyableUserId } from "@/features/users/copyable-user-id";
import {
  displayOptionalText,
  formatUserDateTime,
} from "@/features/users/formatters";
import {
  USER_ROLE_BADGE_VARIANTS,
  USER_ROLE_LABELS,
} from "@/features/users/labels";

type UserSummaryProps = {
  readonly user: AdminUserSummary;
};

export function UserSummary({ user }: UserSummaryProps) {
  return (
    <section aria-labelledby="user-summary-title" className="grid gap-4">
      <h2
        className="text-section font-semibold text-ink-strong"
        id="user-summary-title"
      >
        기본 정보
      </h2>
      <DefinitionList
        items={[
          { label: "이름", value: displayOptionalText(user.name) },
          { label: "이메일", value: displayOptionalText(user.email) },
          {
            label: "역할",
            value: (
              <Badge
                className="whitespace-nowrap"
                variant={USER_ROLE_BADGE_VARIANTS[user.role]}
              >
                {USER_ROLE_LABELS[user.role]}
              </Badge>
            ),
          },
          {
            label: "가입 일시",
            value: (
              <time dateTime={user.createdAt}>
                {formatUserDateTime(user.createdAt)}
              </time>
            ),
          },
          { label: "사용자 ID", value: <CopyableUserId value={user.id} /> },
        ]}
      />
    </section>
  );
}
