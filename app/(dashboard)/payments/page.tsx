import Link from "next/link";

import { AdminApiError } from "@/lib/api/errors";
import { getPayments } from "@/features/payments/data";
import type { Payment } from "@/features/payments/schema";
import {
  PaymentErrorNotice,
  PaymentListView,
} from "@/features/payments/views";

export default async function PaymentsPage() {
  let payments: readonly Payment[];
  try {
    payments = await getPayments();
  } catch (error) {
    if (error instanceof AdminApiError) {
      return (
        <section className="grid gap-6">
          <PaymentErrorNotice />
          <Link
            className="admin-focus admin-interactive admin-control inline-flex w-fit items-center justify-center rounded-control border border-line bg-surface px-4 text-body font-semibold text-ink-strong hover:border-line-strong hover:bg-surface-subtle"
            href="/payments"
          >
            다시 시도
          </Link>
        </section>
      );
    }
    throw error;
  }
  return <PaymentListView payments={payments} />;
}
