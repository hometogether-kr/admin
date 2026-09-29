import type {
  AdminOperationDomain,
  AdminReadOperationId,
} from "@/lib/api/operations";
import type { AdminMenuId } from "@/lib/auth/roles";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;

type ConsultationDomainContract = Expect<
  Equal<Extract<AdminOperationDomain, "hostConsultations">, "hostConsultations">
>;
type ConsultationListOperationContract = Expect<
  Equal<Extract<AdminReadOperationId, "HCR-01">, "HCR-01">
>;
type ConsultationDetailOperationContract = Expect<
  Equal<Extract<AdminReadOperationId, "HCR-02">, "HCR-02">
>;
type ConsultationMenuContract = Expect<
  Equal<Extract<AdminMenuId, "hostConsultations">, "hostConsultations">
>;

export type HostConsultationContractAssertions =
  | ConsultationDomainContract
  | ConsultationListOperationContract
  | ConsultationDetailOperationContract
  | ConsultationMenuContract;
