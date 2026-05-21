import type { PermissionCode } from "../types/permissions";

export function normalizePermission(permission: PermissionCode) {
  return String(permission).trim().replace(/-/g, "_").toUpperCase();
}

export function normalizePermissions(permissions: PermissionCode[] = []) {
  return permissions.map(normalizePermission);
}

export function hasPermission(userPermissions: PermissionCode[] = [], permission: PermissionCode) {
  const normalized = new Set(normalizePermissions(userPermissions));
  return normalized.has(normalizePermission(permission));
}

export function hasAnyPermission(userPermissions: PermissionCode[] = [], permissions: PermissionCode[] = []) {
  if (permissions.length === 0) return true;
  return permissions.some((permission) => hasPermission(userPermissions, permission));
}

export function hasAllPermissions(userPermissions: PermissionCode[] = [], permissions: PermissionCode[] = []) {
  return permissions.every((permission) => hasPermission(userPermissions, permission));
}
