import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { displayOptionalText } from "@/features/users/formatters";
import { UserMutationReceipt } from "@/features/users/mutation-receipt";
import { SanctionHistory } from "@/features/users/sanction-history";
import { SuperAdminActions } from "@/features/users/super-admin-actions";
import { UserSummary } from "@/features/users/user-summary";
import { VerificationActions } from "@/features/users/verification-actions";
import { userIdSchema } from "@/features/users/contracts";
import { getUser, getUserSanctions } from "@/features/users/queries";
import { requireAdminSession } from "@/lib/auth/session";

type UserDetailPageProps = {
  readonly params: Promise<{ readonly id: string }>;
};

export default async function UserDetailPage({
  params,
}: UserDetailPageProps) {
  const resolvedParams = await params;
  const parsedId = userIdSchema.safeParse(resolvedParams.id);
  if (!parsedId.success) notFound();

  const user = await getUser(parsedId.data);
  if (user === null) notFound();

  const session = await requireAdminSession();
  const isSuperAdmin = session.adminRole === "super";
  const sanctions = isSuperAdmin
    ? await getUserSanctions(parsedId.data)
    : null;
  return (
    <div className="grid gap-8">
      <PageHeader
        description="사용자 정보와 허용된 작업을 표시합니다."
        eyebrow={
          <Link
            className="admin-focus font-semibold text-brand underline-offset-4 hover:underline"
            href="/users"
          >
            사용자 목록으로 돌아가기
          </Link>
        }
        title={displayOptionalText(user.name)}
      />
      <UserMutationReceipt userId={user.id} />
      <UserSummary user={user} />
      {user.role === "student" ? (
        <VerificationActions userId={user.id} />
      ) : null}
      {isSuperAdmin ? <SuperAdminActions userId={user.id} /> : null}
      {sanctions === null ? null : (
        <SanctionHistory sanctions={sanctions} />
      )}
    </div>
  );
}
