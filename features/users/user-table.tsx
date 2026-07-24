import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { TableShell } from "@/components/ui/table-shell";
import type { AdminTableColumn } from "@/components/ui/table-shell";
import type { AdminUserSummary } from "@/features/users/contracts";
import { CopyableUserId } from "@/features/users/copyable-user-id";
import {
  displayOptionalText,
  formatUserDate,
} from "@/features/users/formatters";
import {
  USER_ROLE_BADGE_VARIANTS,
  USER_ROLE_LABELS,
} from "@/features/users/labels";

type UserTableProps = {
  readonly users: readonly AdminUserSummary[];
};

const USER_COLUMNS = [
  { key: "name", label: "이름" },
  { key: "email", label: "이메일" },
  { key: "role", label: "역할" },
  { key: "joined", label: "가입일" },
  { key: "id", kind: "identifier", label: "사용자 ID" },
] as const satisfies readonly AdminTableColumn[];

export function UserTable({ users }: UserTableProps) {
  const rows = users.map((user) => ({
    key: user.id,
    cells: [
      <Link
        className="admin-focus admin-break-anywhere font-semibold text-brand underline-offset-4 hover:underline"
        href={`/users/${user.id}`}
        key="name"
      >
        {displayOptionalText(user.name)}
      </Link>,
      <span
        className="whitespace-nowrap"
        key="email"
      >
        {displayOptionalText(user.email)}
      </span>,
      <Badge
        className="whitespace-nowrap"
        key="role"
        variant={USER_ROLE_BADGE_VARIANTS[user.role]}
      >
        {USER_ROLE_LABELS[user.role]}
      </Badge>,
      <time className="whitespace-nowrap" dateTime={user.createdAt} key="joined">
        {formatUserDate(user.createdAt)}
      </time>,
      <CopyableUserId key="id" value={user.id} />,
    ],
  }));

  return (
    <TableShell
      caption="사용자 목록"
      columns={USER_COLUMNS}
      rows={rows}
    />
  );
}
