import { LoadingState } from "@/components/ui/loading-state";

export default function ContractsLoading() {
  return (
    <section className="grid min-h-[60dvb] place-items-center">
      <div className="w-full max-w-lg">
        <LoadingState label="계약 정보를 불러오는 중입니다." />
      </div>
    </section>
  );
}
