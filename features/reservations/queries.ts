import "server-only";

import { AdminApiError } from "@/lib/api/errors";
import { readAdminApi } from "@/lib/api/client";

import {
  reservationIdSchema,
  reservationSchema,
  reservationsSchema,
  type Reservation,
} from "@/features/reservations/schemas";

export async function listReservations(
  returnTo: string,
): Promise<readonly Reservation[]> {
  return readAdminApi({
    operationId: "RES-01",
    responseSchema: reservationsSchema,
    returnTo,
  });
}

export async function findReservation(
  id: string,
  returnTo: string,
): Promise<Reservation | null> {
  const parsedId = reservationIdSchema.safeParse(id);
  if (!parsedId.success) return null;

  try {
    return await readAdminApi({
      operationId: "RES-02",
      pathParameters: { id: parsedId.data },
      responseSchema: reservationSchema,
      returnTo,
    });
  } catch (cause) {
    if (cause instanceof AdminApiError && cause.status === 404) return null;
    throw cause;
  }
}
