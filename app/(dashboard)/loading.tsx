import { LoadingState } from "@/components/ui/loading-state";

export default function Loading() {
  return (
    <section className="grid min-h-[60dvb] place-items-center">
      <div className="w-full max-w-lg">
        <LoadingState label="관리자 화면을 불러오는 중입니다." />
      </div>
    </section>
  );
}
