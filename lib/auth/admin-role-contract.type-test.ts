import type { AdminRole } from "@/lib/api/operations";
import type { AdminSessionInput } from "@/lib/auth/session-schema";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;

type AdminRoleContract = Expect<
  Equal<AdminRole, "super" | "room" | "reservation" | "payment" | "cs">
>;
type SessionAdminRoleContract = Expect<
  Equal<AdminSessionInput["adminRole"], AdminRole>
>;
type NoLegacySessionRoleContract = Expect<
  Equal<Extract<keyof AdminSessionInput, "role">, never>
>;

export type AdminRoleContractAssertions =
  | AdminRoleContract
  | SessionAdminRoleContract
  | NoLegacySessionRoleContract;
