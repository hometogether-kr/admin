"use client";

import { PaymentRouteError } from "@/features/payments/route-error";

type PaymentsErrorProps = {
  readonly error: Error & { readonly digest?: string };
  readonly unstable_retry: () => void;
};

export default function PaymentsError({
  unstable_retry,
}: PaymentsErrorProps) {
  return <PaymentRouteError reset={unstable_retry} />;
}
