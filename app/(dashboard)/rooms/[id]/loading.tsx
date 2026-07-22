import { PageHeader } from "@/components/admin/page-header";
import { LoadingState } from "@/components/ui/loading-state";

export default function RoomDetailLoading() {
  return (
    <div className="grid gap-6">
      <PageHeader description="방 등록 정보와 운영 상태를 준비하고 있습니다." title="방 상세" />
      <LoadingState label="방 상세 정보를 불러오는 중입니다." />
    </div>
  );
}
