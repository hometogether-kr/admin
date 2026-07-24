import { notFound } from "next/navigation";

import { ContractDetail } from "@/features/contracts/contracts-detail";
import { ContractsErrorState } from "@/features/contracts/contracts-error";
import { getContract } from "@/features/contracts/contracts-dal";
import {
  contractIdSchema,
  type Contract,
  type ContractId,
} from "@/features/contracts/contracts-schema";
import { AdminApiError } from "@/lib/api/errors";

type ContractDetailPageProps = {
  readonly params: Promise<{ readonly id: string }>;
};

async function loadContract(id: ContractId): Promise<Contract | null> {
  try {
    return await getContract(id);
  } catch (cause) {
    if (cause instanceof AdminApiError && cause.status === 404) notFound();
    if (cause instanceof AdminApiError) return null;
    throw cause;
  }
}

export default async function ContractDetailPage({
  params,
}: ContractDetailPageProps) {
  const { id } = await params;
  const parsedId = contractIdSchema.safeParse(id);
  if (!parsedId.success) notFound();

  const contract = await loadContract(parsedId.data);
  if (contract === null) return <ContractsErrorState />;
  return <ContractDetail contract={contract} />;
}
