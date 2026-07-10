export type AdminRole = "owner" | "Admin" | "Sub Admin";
export type PermissionAction = "view" | "edit" | "delete";
export type DashboardModule =
  | "dashboard"
  | "schools"
  | "users"
  | "subscriptions"
  | "payments"
  | "analytics"
  | "support"
  | "audit"
  | "settings"
  | "admins";

export type ModulePermissions = Record<DashboardModule, Record<PermissionAction, boolean>>;

export interface MockCredential {
  email: string;
  password: string;
  role: AdminRole;
}

export const AUTH_STORAGE_KEYS = {
  token: "token",
  role: "role",
  type: "type",
  schoolId: "schoolId",
  permissions: "permissions",
} as const;

export const DEFAULT_ROLE: AdminRole = "owner";
export const DEFAULT_PASSWORD = "School@123";

export const ROLE_DISPLAY_NAMES: Record<AdminRole, string> = {
  "owner": "Owner",
  "Admin": "Admin",
  "Sub Admin": "Sub Admin",
};

const ALL_MODULES: DashboardModule[] = [
  "dashboard",
  "schools",
  "users",
  "subscriptions",
  "payments",
  "analytics",
  "support",
  "audit",
  "settings",
  "admins"
];

const createModulePermissions = (
  view: boolean,
  edit: boolean,
  remove: boolean,
): Record<PermissionAction, boolean> => ({
  view,
  edit,
  delete: remove,
});

function createPermissionsForModules(
  modules: Partial<Record<DashboardModule, Record<PermissionAction, boolean>>>,
): ModulePermissions {
  return ALL_MODULES.reduce((permissions, module) => {
    permissions[module] = modules[module] ?? createModulePermissions(false, false, false);
    return permissions;
  }, {} as ModulePermissions);
}

export const DEFAULT_PERMISSIONS: Record<AdminRole, ModulePermissions> = {
  "owner": createPermissionsForModules(
    Object.fromEntries(ALL_MODULES.map((module) => [module, createModulePermissions(true, true, true)])) as Partial<Record<DashboardModule, Record<PermissionAction, boolean>>>,
  ),
  Admin: createPermissionsForModules({
    dashboard: createModulePermissions(true, true, false),
    schools: createModulePermissions(true, true, false),
    users: createModulePermissions(true, true, false),
    subscriptions: createModulePermissions(true, true, false),
    payments: createModulePermissions(true, true, false),
    analytics: createModulePermissions(true, true, false),
    support: createModulePermissions(true, false, false),
    admins: createModulePermissions(false, false, false),
  }),
  "Sub Admin": createPermissionsForModules({
    dashboard: createModulePermissions(true, false, false),
    schools: createModulePermissions(true, false, false),
    users: createModulePermissions(true, false, false),
    support: createModulePermissions(true, false, false),
    admins: createModulePermissions(false, false, false),
  }),
};

export function isAdminRole(value: string | null | undefined): value is AdminRole {
  return value === "owner" || value === "Admin" || value === "Sub Admin";
}

export function normalizeRole(value: string | null | undefined): AdminRole {
  return isAdminRole(value) ? value : DEFAULT_ROLE;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function getRoleDisplayName(role: AdminRole) {
  return ROLE_DISPLAY_NAMES[role];
}

export function getDefaultPermissions(role: AdminRole): ModulePermissions {
  return DEFAULT_PERMISSIONS[role];
}

export function parsePermissions(value: string | null | undefined): ModulePermissions | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<ModulePermissions>;
    return createPermissionsForModules(parsed);
  } catch {
    return null;
  }
}

export function hasPermission(role: AdminRole, module: DashboardModule, action: PermissionAction): boolean {
  const permissions = getDefaultPermissions(role);
  return permissions[module][action];
}

export function hasModuleAccess(permissions: ModulePermissions, module: DashboardModule) {
  return Boolean(permissions[module]?.view);
}

export function canPerform(
  permissions: ModulePermissions,
  module: DashboardModule,
  action: PermissionAction,
) {
  return Boolean(permissions[module]?.[action]);
}

export function readStoredRole() {
  if (typeof window === "undefined") {
    return DEFAULT_ROLE;
  }

  return normalizeRole(localStorage.getItem(AUTH_STORAGE_KEYS.role));
}

export function readStoredPermissions() {
  if (typeof window === "undefined") {
    return DEFAULT_PERMISSIONS[DEFAULT_ROLE];
  }

  return parsePermissions(localStorage.getItem(AUTH_STORAGE_KEYS.permissions)) ?? getDefaultPermissions(readStoredRole());
}


export function mapBackendRoleToFrontend(role: string): AdminRole {
  if (role === 'System Admin' || role === 'owner' || role === 'Super Admin') return 'owner';
  if (role === 'School Admin' || role === 'admin' || role === 'Admin') return 'Admin';
  return 'Sub Admin';
}
