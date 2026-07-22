import Link from "next/link";
import { notFound } from "next/navigation";

import { RouteState } from "@/components/admin/route-state";
import { AdminApiError } from "@/lib/api/errors";
import { getPayment } from "@/features/payments/data";
import { paymentIdSchema, type Payment } from "@/features/payments/schema";
import {
  PaymentDetailView,
  PaymentErrorNotice,
} from "@/features/payments/views";

type PaymentDetailPageProps = {
  readonly params: Promise<{ readonly id: string }>;
};

export default async function PaymentDetailPage({
  params,
}: PaymentDetailPageProps) {
  const { id } = await params;
  const parsedId = paymentIdSchema.safeParse(id);
  if (!parsedId.success) notFound();

  let payment: Payment;
  try {
    payment = await getPayment(parsedId.data);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) notFound();
    if (error instanceof AdminApiError) {
      return (
        <section className="grid gap-6">
          <PaymentErrorNotice />
          <RouteState
            action={
              <Link
                className="admin-focus admin-interactive admin-control inline-flex items-center justify-center rounded-control border border-line bg-surface px-4 text-body font-semibold text-ink-strong hover:border-line-strong hover:bg-surface-subtle"
                href="/payments"
              >
                결제 목록으로 돌아가기
              </Link>
            }
            code="ERROR"
            description="결제 목록으로 돌아가 다시 선택해 주세요."
            title="결제 상세 조회 오류"
          />
        </section>
      );
    }
    throw error;
  }
  return <PaymentDetailView payment={payment} />;
}
