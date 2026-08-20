export const ADMIN_ROLES = [
  "super",
  "room",
  "reservation",
  "payment",
  "cs",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
