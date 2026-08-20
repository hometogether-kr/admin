import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { getUsers } from "@/features/users/queries";
import { UserTable } from "@/features/users/user-table";
import { UserMutationReceipt } from "@/features/users/mutation-receipt";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="grid gap-6">
      <PageHeader
        description="검색·페이지 이동은 지원하지 않습니다."
        title="사용자 관리"
      />
      <UserMutationReceipt surface="list" />
      {users.length === 0 ? (
        <EmptyState
          description="잠시 후 다시 확인해 주세요."
          title="사용자가 없습니다"
        />
      ) : (
        <UserTable users={users} />
      )}
    </div>
  );
}
