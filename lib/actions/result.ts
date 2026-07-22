export type AdminActionResult =
  | { readonly kind: "idle" }
  | { readonly kind: "success"; readonly message: string }
  | { readonly kind: "error"; readonly message: string };

export const INITIAL_ADMIN_ACTION_RESULT = { kind: "idle" } as const satisfies AdminActionResult;

export function adminActionSuccess(message: string): AdminActionResult {
  return { kind: "success", message };
}

export function adminActionFailure(message: string): AdminActionResult {
  return { kind: "error", message };
}
