export type AdminActionResult =
  | { readonly kind: "idle" }
  | { readonly kind: "success"; readonly message: string }
  | { readonly kind: "error"; readonly message: string };

export type AdminActionError = Extract<
  AdminActionResult,
  { readonly kind: "error" }
>;

export type AdminActionSuccess = Extract<
  AdminActionResult,
  { readonly kind: "success" }
>;

export const INITIAL_ADMIN_ACTION_RESULT = { kind: "idle" } as const satisfies AdminActionResult;

export function adminActionSuccess(message: string): AdminActionSuccess {
  return { kind: "success", message };
}

export function adminActionFailure(message: string): AdminActionError {
  return { kind: "error", message };
}
