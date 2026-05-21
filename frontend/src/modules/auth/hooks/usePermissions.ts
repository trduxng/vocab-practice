"use client";

import { useAuth } from "@/src/app/context/AuthContext";
import type { PermissionCode } from "../types/permissions";
import { hasAllPermissions, hasAnyPermission, hasPermission } from "../utils/permissions";

export function usePermissions() {
  const { permissions } = useAuth();

  return {
    permissions,
    hasPermission: (permission: PermissionCode) => hasPermission(permissions, permission),
    hasAnyPermission: (required: PermissionCode[]) => hasAnyPermission(permissions, required),
    hasAllPermissions: (required: PermissionCode[]) => hasAllPermissions(permissions, required),
  };
}
