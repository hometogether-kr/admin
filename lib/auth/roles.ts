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

export const ADMIN_MENU_REQUEST_HEADER = "x-hometogether-admin-menu-id";

export const ADMIN_ROLE_MENUS = {
  super: [
    "users",
    "rooms",
    "reservations",
    "contracts",
    "payments",
    "reports",
    "supports",
    "notificationLogs",
  ],
  room: ["rooms"],
  reservation: ["reservations"],
  payment: ["payments"],
  cs: ["reports", "supports", "notificationLogs"],
} as const satisfies Record<AdminRole, readonly AdminMenuId[]>;

export const ADMIN_ROLE_DEFAULT_ROUTES = {
  super: "/users",
  room: "/rooms",
  reservation: "/reservations",
  payment: "/payments",
  cs: "/reports",
} as const satisfies Record<AdminRole, AdminDefaultRoute>;

export const ADMIN_ROLE_LABELS = {
  super: "최고 관리자",
  room: "방 관리자",
  reservation: "예약 관리자",
  payment: "결제 관리자",
  cs: "고객 지원 관리자",
} as const satisfies Record<AdminRole, string>;

export const adminRoleSchema = z.enum(ADMIN_ROLES);

export function parseAdminRole(value: unknown): AdminRole | null {
  const parsed = adminRoleSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function roleCanAccessMenu(role: AdminRole, menu: AdminMenuId): boolean {
  return ADMIN_ROLE_MENUS[role].some((allowedMenu) => allowedMenu === menu);
}
