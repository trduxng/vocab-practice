"use client";

import type { ReactNode } from "react";
import type { PermissionCode } from "../types/permissions";
import { usePermissions } from "../hooks/usePermissions";

export function PermissionGate({
  anyOf,
  allOf,
  fallback = null,
  children,
}: {
  anyOf?: PermissionCode[];
  allOf?: PermissionCode[];
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();
  const allowed = allOf?.length ? hasAllPermissions(allOf) : hasAnyPermission(anyOf || []);

  return allowed ? children : fallback;
}
