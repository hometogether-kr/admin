import "server-only";

import ky, { TimeoutError, type Options } from "ky";
import { z } from "zod";

import { AdminApiError } from "@/lib/api/errors";
import { adminHttpErrorSchema } from "@/lib/api/http-error-schema";
import type { AdminOperationId } from "@/lib/api/operations";
import {
  buildAdminOperationPath,
  buildAdminSearchParams,
  type AdminPathParameters,
  type AdminQuery,
} from "@/lib/api/request-path";
import { authorizeAdminSessionForOperation } from "@/lib/auth/authorize";
import type { AdminSessionInput } from "@/lib/auth/session-schema";
import { env } from "@/lib/env";

export type AdminJsonValue =
  | null
  | boolean
  | number
  | string
  | readonly AdminJsonValue[]
  | { readonly [key: string]: AdminJsonValue };

export type AdminJsonBody = Readonly<Record<string, AdminJsonValue>>;

type AdminApiSession = Pick<AdminSessionInput, "role" | "accessToken">;

export type AdminTransportRequest = {
  readonly operationId: AdminOperationId;
  readonly session: AdminApiSession;
  readonly pathParameters?: AdminPathParameters;
  readonly query?: AdminQuery;
  readonly body?: AdminJsonBody;
};

const adminApi = ky.create({
  baseUrl: env.ADMIN_API_BASE_URL,
  cache: "no-store",
  credentials: "omit",
  headers: { Accept: "application/json" },
  redirect: "manual",
  retry: 0,
  throwHttpErrors: false,
  timeout: 10_000,
});

function requestOptions(request: AdminTransportRequest): Options {
  const operation = authorizeAdminSessionForOperation(
    request.operationId,
    request.session,
  );
  const searchParams = buildAdminSearchParams(operation, request.query);
  return {
    method: operation.method,
    headers: { Authorization: `Bearer ${request.session.accessToken}` },
    ...(searchParams === undefined ? {} : { searchParams }),
    ...(request.body === undefined ? {} : { json: request.body }),
  };
}

async function responseFor(request: AdminTransportRequest): Promise<Response> {
  // The bearer token is attached only at this server-only upstream boundary.
  const operation = authorizeAdminSessionForOperation(
    request.operationId,
    request.session,
  );
  const path = buildAdminOperationPath(operation, request.pathParameters);
  try {
    return await adminApi(path, requestOptions(request));
  } catch (cause) {
    if (cause instanceof TimeoutError) {
      throw new AdminApiError({ kind: "timeout", operationId: operation.id, cause });
    }
    if (cause instanceof Error) {
      throw new AdminApiError({
        kind: "transport",
        operationId: operation.id,
        cause,
      });
    }
    throw cause;
  }
}

async function statusError(
  response: Response,
  request: AdminTransportRequest,
): Promise<AdminApiError> {
  // Validate error structure for diagnostics without reflecting its contents to clients.
  let cause: Error | undefined;
  try {
    const payload: unknown = await response.json();
    const parsed = adminHttpErrorSchema.safeParse(payload);
    if (!parsed.success) cause = parsed.error;
  } catch (parseCause) {
    if (parseCause instanceof Error) cause = parseCause;
    else throw parseCause;
  }
  return new AdminApiError({
    kind: response.status >= 400 && response.status <= 599
      ? "http"
      : "unexpectedStatus",
    operationId: request.operationId,
    status: response.status,
    cause,
  });
}

export async function executeAdminJson<Schema extends z.ZodType>(
  input: {
    readonly request: AdminTransportRequest;
    readonly responseSchema: Schema;
  },
): Promise<z.output<Schema>> {
  const operation = authorizeAdminSessionForOperation(
    input.request.operationId,
    input.request.session,
  );
  if (operation.successStatus === 204) {
    throw new AdminApiError({ kind: "request", operationId: operation.id });
  }
  const response = await responseFor(input.request);
  if (response.status !== operation.successStatus) {
    throw await statusError(response, input.request);
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (cause) {
    if (cause instanceof Error) {
      throw new AdminApiError({
        kind: "invalidJson",
        operationId: operation.id,
        status: response.status,
        cause,
      });
    }
    throw cause;
  }
  const parsed = input.responseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new AdminApiError({
      kind: "schema",
      operationId: operation.id,
      status: response.status,
      cause: parsed.error,
    });
  }
  return parsed.data;
}

export async function executeAdminNoContent(
  request: AdminTransportRequest,
): Promise<void> {
  const operation = authorizeAdminSessionForOperation(
    request.operationId,
    request.session,
  );
  if (operation.successStatus !== 204) {
    throw new AdminApiError({ kind: "request", operationId: operation.id });
  }
  const response = await responseFor(request);
  if (response.status !== operation.successStatus) {
    throw await statusError(response, request);
  }
}
