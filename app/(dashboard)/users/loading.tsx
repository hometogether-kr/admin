import { LoadingState } from "@/components/ui/loading-state";

export default function UsersLoading() {
  return (
    <section className="grid min-h-[60dvb] place-items-center">
      <div className="w-full max-w-lg">
        <LoadingState label="사용자 목록을 불러오는 중입니다." />
      </div>
    </section>
  );
}
