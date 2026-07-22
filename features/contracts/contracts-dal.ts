import "server-only";

import { readAdminApi } from "@/lib/api/client";

import {
  contractSchema,
  contractsSchema,
  type Contract,
  type ContractId,
} from "./contracts-schema";

export async function listContracts(): Promise<readonly Contract[]> {
  return readAdminApi({
    operationId: "CON-01",
    responseSchema: contractsSchema,
    returnTo: "/contracts",
  });
}

export async function getContract(id: ContractId): Promise<Contract> {
  return readAdminApi({
    operationId: "CON-02",
    pathParameters: { id },
    responseSchema: contractSchema,
    returnTo: `/contracts/${id}`,
  });
}
