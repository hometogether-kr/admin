import { PageHeader } from "@/components/admin/page-header";
import { LoadingState } from "@/components/ui/loading-state";

export default function RoomsLoading() {
  return (
    <div className="grid gap-6">
      <PageHeader description="방 목록을 준비하고 있습니다." title="방 관리" />
      <LoadingState label="방 목록을 불러오는 중입니다." />
    </div>
  );
}
