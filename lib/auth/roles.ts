import "server-only";

import { z } from "zod";

import { ADMIN_ROLES, type AdminRole } from "@/lib/api/operations";

export const ADMIN_MENU_ITEMS = [
  { id: "users", label: "Users", path: "/users" },
  { id: "rooms", label: "Rooms", path: "/rooms" },
  { id: "reservations", label: "Reservations", path: "/reservations" },
  { id: "contracts", label: "Contracts", path: "/contracts" },
  { id: "payments", label: "Payments", path: "/payments" },
  { id: "reports", label: "Reports", path: "/reports" },
  { id: "supports", label: "Supports", path: "/supports" },
  {
    id: "notificationLogs",
    label: "Notification Logs",
    path: "/notification-logs",
  },
] as const;

export type AdminMenuId = (typeof ADMIN_MENU_ITEMS)[number]["id"];
export type AdminDefaultRoute = (typeof ADMIN_MENU_ITEMS)[number]["path"];

export const ADMIN_ROLE_MENUS = {
  admin: [
    "users",
    "rooms",
    "reservations",
    "contracts",
    "payments",
    "reports",
    "supports",
    "notificationLogs",
  ],
  superAdmin: [
    "users",
    "rooms",
    "reservations",
    "contracts",
    "payments",
    "reports",
    "supports",
    "notificationLogs",
  ],
  roomManager: ["rooms"],
  reservationManager: ["reservations"],
  paymentManager: ["payments"],
  csManager: ["reports", "supports", "notificationLogs"],
} as const satisfies Record<AdminRole, readonly AdminMenuId[]>;

export const ADMIN_ROLE_DEFAULT_ROUTES = {
  admin: "/users",
  superAdmin: "/users",
  roomManager: "/rooms",
  reservationManager: "/reservations",
  paymentManager: "/payments",
  csManager: "/reports",
} as const satisfies Record<AdminRole, AdminDefaultRoute>;

export const adminRoleSchema = z.enum(ADMIN_ROLES);

export function parseAdminRole(value: unknown): AdminRole | null {
  const parsed = adminRoleSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function roleCanAccessMenu(role: AdminRole, menu: AdminMenuId): boolean {
  return ADMIN_ROLE_MENUS[role].some((allowedMenu) => allowedMenu === menu);
}
