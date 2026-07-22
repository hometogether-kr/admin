import "server-only";

export const ADMIN_ROLES = [
  "admin",
  "superAdmin",
  "roomManager",
  "reservationManager",
  "paymentManager",
  "csManager",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
export type AdminOperationDomain =
  | "users"
  | "rooms"
  | "reservations"
  | "contracts"
  | "payments"
  | "reports"
  | "supports"
  | "notificationLogs";

export type AdminOperationContract = {
  readonly id: string;
  readonly domain: AdminOperationDomain;
  readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly path: `/admin/${string}`;
  readonly roles: readonly AdminRole[];
  readonly successStatus: 200 | 201 | 204;
  readonly response: string;
  readonly query: readonly string[];
  readonly body: readonly string[];
  readonly requestSource:
    | "not-applicable"
    | "production-swagger"
    | "local-controller-supplement";
  readonly rolesSource: "local-controller";
};

export const ADMIN_OPERATIONS = [
  { id: "USR-01", domain: "users", method: "GET", path: "/admin/users", roles: ["admin", "superAdmin"], successStatus: 200, response: "AdminUserSummary[]", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "USR-02", domain: "users", method: "GET", path: "/admin/users/{id}", roles: ["admin", "superAdmin"], successStatus: 200, response: "AdminUserSummary|null", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "USR-03", domain: "users", method: "POST", path: "/admin/users/{id}/disablements", roles: ["superAdmin"], successStatus: 201, response: "{success:boolean}", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "USR-04", domain: "users", method: "GET", path: "/admin/users/{id}/sanctions", roles: ["superAdmin"], successStatus: 200, response: "Sanction[]", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "USR-05", domain: "users", method: "POST", path: "/admin/users/{id}/sanctions", roles: ["superAdmin"], successStatus: 201, response: "Sanction", query: [], body: ["sanctionType", "reason", "expiresAt?", "reportId?"], requestSource: "production-swagger", rolesSource: "local-controller" },
  { id: "USR-06", domain: "users", method: "POST", path: "/admin/students/{id}/verification-approvals", roles: ["admin", "superAdmin"], successStatus: 201, response: "StudentProfile", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "USR-07", domain: "users", method: "POST", path: "/admin/students/{id}/verification-rejections", roles: ["admin", "superAdmin"], successStatus: 201, response: "StudentProfile", query: [], body: ["reason"], requestSource: "local-controller-supplement", rolesSource: "local-controller" },
  { id: "ROM-01", domain: "rooms", method: "GET", path: "/admin/rooms", roles: ["admin", "roomManager", "superAdmin"], successStatus: 200, response: "{items,total,page,limit,totalPages}", query: ["page", "limit", "status", "hostId"], body: [], requestSource: "production-swagger", rolesSource: "local-controller" },
  { id: "ROM-02", domain: "rooms", method: "GET", path: "/admin/rooms/{id}", roles: ["admin", "roomManager", "superAdmin"], successStatus: 200, response: "registrationContractVersion:2|null union", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "ROM-03", domain: "rooms", method: "POST", path: "/admin/rooms/{id}/approvals", roles: ["admin", "roomManager", "superAdmin"], successStatus: 201, response: "Room", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "ROM-04", domain: "rooms", method: "POST", path: "/admin/rooms/{id}/rejections", roles: ["admin", "roomManager", "superAdmin"], successStatus: 201, response: "Room", query: [], body: ["reason"], requestSource: "local-controller-supplement", rolesSource: "local-controller" },
  { id: "ROM-05", domain: "rooms", method: "POST", path: "/admin/rooms/{id}/revision-requests", roles: ["admin", "roomManager", "superAdmin"], successStatus: 201, response: "Room", query: [], body: ["message"], requestSource: "local-controller-supplement", rolesSource: "local-controller" },
  { id: "ROM-06", domain: "rooms", method: "POST", path: "/admin/rooms/{id}/hidings", roles: ["admin", "superAdmin"], successStatus: 201, response: "Room", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "ROM-07", domain: "rooms", method: "POST", path: "/admin/rooms/{id}/notification-resends", roles: ["admin", "roomManager", "superAdmin"], successStatus: 204, response: "void", query: [], body: ["templateCode"], requestSource: "production-swagger", rolesSource: "local-controller" },
  { id: "ROM-08", domain: "rooms", method: "PATCH", path: "/admin/rooms/{id}/address-detail-visibility", roles: ["admin", "roomManager", "superAdmin"], successStatus: 200, response: "Room", query: [], body: ["hidden"], requestSource: "local-controller-supplement", rolesSource: "local-controller" },
  { id: "ROM-09", domain: "rooms", method: "PATCH", path: "/admin/rooms/{id}/internal-memo", roles: ["admin", "roomManager", "superAdmin"], successStatus: 200, response: "Room", query: [], body: ["memo"], requestSource: "local-controller-supplement", rolesSource: "local-controller" },
  { id: "ROM-10", domain: "rooms", method: "DELETE", path: "/admin/rooms/{id}/media/{mediaId}", roles: ["admin", "roomManager", "superAdmin"], successStatus: 204, response: "void", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "ROM-11", domain: "rooms", method: "DELETE", path: "/admin/rooms/{id}", roles: ["admin", "roomManager", "superAdmin"], successStatus: 204, response: "void", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "RES-01", domain: "reservations", method: "GET", path: "/admin/reservations", roles: ["admin", "reservationManager", "superAdmin"], successStatus: 200, response: "Reservation[]", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "RES-02", domain: "reservations", method: "GET", path: "/admin/reservations/{id}", roles: ["admin", "reservationManager", "superAdmin"], successStatus: 200, response: "Reservation", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "RES-03", domain: "reservations", method: "PUT", path: "/admin/reservations/{id}/status", roles: ["admin", "reservationManager", "superAdmin"], successStatus: 200, response: "Reservation", query: [], body: ["status", "note?"], requestSource: "local-controller-supplement", rolesSource: "local-controller" },
  { id: "RES-04", domain: "reservations", method: "POST", path: "/admin/reservations/{id}/notification-resends", roles: ["admin", "reservationManager", "superAdmin"], successStatus: 204, response: "void", query: [], body: ["templateCode"], requestSource: "production-swagger", rolesSource: "local-controller" },
  { id: "CON-01", domain: "contracts", method: "GET", path: "/admin/contracts", roles: ["admin", "superAdmin"], successStatus: 200, response: "Contract[]", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "CON-02", domain: "contracts", method: "GET", path: "/admin/contracts/{id}", roles: ["admin", "superAdmin"], successStatus: 200, response: "Contract", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "PAY-01", domain: "payments", method: "GET", path: "/admin/payments", roles: ["admin", "paymentManager", "superAdmin"], successStatus: 200, response: "Payment[]", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "PAY-02", domain: "payments", method: "GET", path: "/admin/payments/{id}", roles: ["admin", "paymentManager", "superAdmin"], successStatus: 200, response: "Payment", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "REP-01", domain: "reports", method: "GET", path: "/admin/reports", roles: ["admin", "csManager", "superAdmin"], successStatus: 200, response: "PaginatedResult<Report>", query: ["page", "limit", "status", "targetType"], body: [], requestSource: "production-swagger", rolesSource: "local-controller" },
  { id: "REP-02", domain: "reports", method: "GET", path: "/admin/reports/{id}", roles: ["admin", "csManager", "superAdmin"], successStatus: 200, response: "Report", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "REP-03", domain: "reports", method: "POST", path: "/admin/reports/{id}/resolutions", roles: ["admin", "csManager", "superAdmin"], successStatus: 201, response: "Report", query: [], body: ["status", "memo?"], requestSource: "production-swagger", rolesSource: "local-controller" },
  { id: "SUP-01", domain: "supports", method: "GET", path: "/admin/supports", roles: ["admin", "csManager", "superAdmin"], successStatus: 200, response: "{items,total,page,limit}", query: ["status", "inquiryType", "page", "limit"], body: [], requestSource: "production-swagger", rolesSource: "local-controller" },
  { id: "SUP-02", domain: "supports", method: "GET", path: "/admin/supports/{id}", roles: ["admin", "csManager", "superAdmin"], successStatus: 200, response: "Support", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "SUP-03", domain: "supports", method: "POST", path: "/admin/supports/{id}/resolutions", roles: ["admin", "csManager", "superAdmin"], successStatus: 201, response: "Support", query: [], body: ["resolution", "adminNote?"], requestSource: "production-swagger", rolesSource: "local-controller" },
  { id: "SUP-04", domain: "supports", method: "POST", path: "/admin/supports/{id}/dismissals", roles: ["admin", "csManager", "superAdmin"], successStatus: 201, response: "Support", query: [], body: ["resolution", "adminNote?"], requestSource: "production-swagger", rolesSource: "local-controller" },
  { id: "NOT-01", domain: "notificationLogs", method: "GET", path: "/admin/notification-logs", roles: ["admin", "csManager", "superAdmin"], successStatus: 200, response: "{items,total,page,limit}", query: ["page", "limit"], body: [], requestSource: "production-swagger", rolesSource: "local-controller" },
  { id: "NOT-02", domain: "notificationLogs", method: "GET", path: "/admin/notification-logs/{id}", roles: ["admin", "csManager", "superAdmin"], successStatus: 200, response: "MaskedNotificationLog", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
  { id: "NOT-03", domain: "notificationLogs", method: "POST", path: "/admin/notification-logs/{id}/resend", roles: ["admin", "csManager", "superAdmin"], successStatus: 204, response: "void", query: [], body: [], requestSource: "not-applicable", rolesSource: "local-controller" },
] as const satisfies readonly AdminOperationContract[];

export type AdminOperation = (typeof ADMIN_OPERATIONS)[number];
export type AdminOperationId = (typeof ADMIN_OPERATIONS)[number]["id"];
export type AdminReadOperationId = Extract<
  AdminOperation,
  { readonly method: "GET" }
>["id"];
export type AdminMutationOperationId = Exclude<
  AdminOperationId,
  AdminReadOperationId
>;
