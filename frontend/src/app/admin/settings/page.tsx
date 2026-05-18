"use client";

import { useEffect, useMemo, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { AdminPage, AdminPanel, KpiCard, StatusBadge, TableShell, ToolbarButton } from "@/src/components/admin/AdminPrimitives";
import { adminService } from "@/src/services/admin.service";
import { Check, Database, KeyRound, PlugZap, Save, Settings2, ShieldCheck, SlidersHorizontal, UsersRound } from "lucide-react";

type SettingsData = {
  summary?: {
    totalRoles?: number;
    totalPermissions?: number;
    assignedPermissions?: number;
    activeUsers?: number;
    mediaAssets?: number;
  };
  roles?: Array<{ id: number; name: string; description?: string; permissionCount: number }>;
  permissions?: Array<{ roleName: string; permissionCode: string; description?: string }>;
  modules?: Array<{ name: string; existsInDatabase: boolean }>;
};

function compactNumber(value?: number | null) {
  return Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));
}

export default function AdminSettings() {
  const [siteName, setSiteName] = useState("VocaBoost");
  const [publicSignup, setPublicSignup] = useState(true);
  const [autoModeration, setAutoModeration] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      try {
        const response = await adminService.getSystemSettings();
        if (!cancelled) setData(response);
      } catch (error) {
        console.error("Failed to fetch system settings", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  const permissionsByRole = useMemo(() => {
    const map = new Map<string, Array<{ permissionCode: string; description?: string }>>();
    for (const permission of data?.permissions || []) {
      const list = map.get(permission.roleName) || [];
      list.push(permission);
      map.set(permission.roleName, list);
    }
    return map;
  }, [data]);

  const switches: Array<[string, boolean, (next: boolean) => void]> = [
    ["Public signup", publicSignup, setPublicSignup],
    ["Auto moderation", autoModeration, setAutoModeration],
    ["Maintenance mode", maintenanceMode, setMaintenanceMode],
  ];

  return (
    <>
      <Topbar title="System settings" subtitle="Real roles, permissions, modules, and operational state from SQL Server." role="admin" userName="Admin" />
      <AdminPage>
        {loading ? (
          <AdminPanel>
            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Loading settings...</div>
          </AdminPanel>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Roles" value={compactNumber(data?.summary?.totalRoles)} change={`${compactNumber(data?.summary?.assignedPermissions)} assignments`} icon={UsersRound} tone="emerald" />
              <KpiCard label="Permissions" value={compactNumber(data?.summary?.totalPermissions)} change="Database permission codes" icon={KeyRound} tone="blue" />
              <KpiCard label="Active users" value={compactNumber(data?.summary?.activeUsers)} change="Enabled accounts" icon={ShieldCheck} tone="violet" />
              <KpiCard label="Media assets" value={compactNumber(data?.summary?.mediaAssets)} change="Uploaded files" icon={PlugZap} tone="amber" />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <AdminPanel title="Role permissions" description="Roles and their assigned permission counts from RolePermissions." action={<ToolbarButton active><Save className="h-4 w-4" />Read only</ToolbarButton>}>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  {(data?.roles || []).map((role) => (
                    <div key={role.id} className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                      <div className="flex items-start justify-between gap-3">
                        <div><h3 className="font-semibold text-slate-950 dark:text-white">{role.name}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{role.description || "No description"}</p></div>
                        <p className="text-lg font-semibold text-slate-950 dark:text-white">{role.permissionCount}</p>
                      </div>
                      <div className="mt-4 space-y-2">
                        {(permissionsByRole.get(role.name) || []).slice(0, 4).map((permission) => <p key={permission.permissionCode} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Check className="h-3.5 w-3.5 text-emerald-500" />{permission.permissionCode}</p>)}
                      </div>
                    </div>
                  ))}
                </div>
              </AdminPanel>

              <AdminPanel title="Site configuration" description="Local UI settings for the admin workspace." action={<Settings2 className="h-4 w-4 text-slate-400" />}>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Site name</span>
                    <input value={siteName} onChange={(event) => setSiteName(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200" />
                  </label>
                  {switches.map(([label, value, setter]) => (
                    <button key={label} onClick={() => setter(!value)} className="flex w-full items-center justify-between rounded-md border border-slate-200 p-3 text-left dark:border-white/10">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
                      <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${value ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}>
                        <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${value ? "translate-x-4" : ""}`} />
                      </span>
                    </button>
                  ))}
                </div>
              </AdminPanel>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
              <AdminPanel title="Database modules" description="Feature tables currently present in ToeicVocabularyPlatform." action={<Database className="h-4 w-4 text-slate-400" />}>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {(data?.modules || []).map((module) => (
                    <div key={module.name} className="flex items-center justify-between rounded-md border border-slate-200 p-4 dark:border-white/10">
                      <div><p className="font-medium text-slate-950 dark:text-white">{module.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">SQL table/module</p></div>
                      <StatusBadge tone={module.existsInDatabase ? "emerald" : "amber"}>{module.existsInDatabase ? "Ready" : "Missing"}</StatusBadge>
                    </div>
                  ))}
                </div>
              </AdminPanel>

              <AdminPanel title="Operational controls" description="High-impact actions that should be backed by API endpoints before production use." action={<SlidersHorizontal className="h-4 w-4 text-slate-400" />}>
                <div className="space-y-3">
                  <ToolbarButton><Database className="h-4 w-4" />Export schema snapshot</ToolbarButton>
                  <ToolbarButton><PlugZap className="h-4 w-4" />Check missing modules</ToolbarButton>
                  <ToolbarButton><ShieldCheck className="h-4 w-4" />Review permissions</ToolbarButton>
                </div>
              </AdminPanel>
            </div>

            <TableShell>
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  <tr><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Permission</th><th className="px-4 py-3 font-medium">Description</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {(data?.permissions || []).map((permission) => (
                    <tr key={`${permission.roleName}-${permission.permissionCode}`} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-4 py-4"><StatusBadge tone="blue">{permission.roleName}</StatusBadge></td>
                      <td className="px-4 py-4 font-medium text-slate-950 dark:text-white">{permission.permissionCode}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{permission.description || "No description"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </>
        )}
      </AdminPage>
    </>
  );
}
