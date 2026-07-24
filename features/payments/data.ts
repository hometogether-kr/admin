import "server-only";

import { readAdminApi } from "@/lib/api/client";

import {
  paymentSchema,
  paymentsSchema,
  type Payment,
} from "@/features/payments/schema";

export async function getPayments(): Promise<readonly Payment[]> {
  return readAdminApi({
    operationId: "PAY-01",
    responseSchema: paymentsSchema,
    returnTo: "/payments",
  });
}

export async function getPayment(id: string): Promise<Payment> {
  return readAdminApi({
    operationId: "PAY-02",
    pathParameters: { id },
    responseSchema: paymentSchema,
    returnTo: "/payments",
  });
}
