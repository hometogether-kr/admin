"use client";

import { PaymentRouteError } from "@/features/payments/route-error";

type PaymentDetailErrorProps = {
  readonly error: Error & { readonly digest?: string };
  readonly unstable_retry: () => void;
};

export default function PaymentDetailError({
  unstable_retry,
}: PaymentDetailErrorProps) {
  return <PaymentRouteError reset={unstable_retry} />;
}
