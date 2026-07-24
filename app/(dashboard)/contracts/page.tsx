import { ContractsList } from "@/features/contracts/contracts-list";
import { ContractsErrorState } from "@/features/contracts/contracts-error";
import { listContracts } from "@/features/contracts/contracts-dal";
import { AdminApiError } from "@/lib/api/errors";

async function loadContracts() {
  try {
    return { kind: "success" as const, contracts: await listContracts() };
  } catch (cause) {
    if (cause instanceof AdminApiError) return { kind: "error" as const };
    throw cause;
  }
}

export default async function ContractsPage() {
  const result = await loadContracts();
  if (result.kind === "error") return <ContractsErrorState />;
  return <ContractsList contracts={result.contracts} />;
}
