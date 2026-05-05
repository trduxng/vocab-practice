"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Topbar from "@/src/components/shared/Topbar";
import { adminService } from "@/src/services/admin.service";
import {
  AdminPage,
  AdminPanel,
  IconButton,
  KpiCard,
  StatusBadge,
  TableShell,
  ToolbarButton,
} from "@/src/components/admin/AdminPrimitives";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Mail,
  Search,
  Shield,
  ShieldOff,
  UserCheck,
  Users,
} from "lucide-react";

type UserStatus = "active" | "banned";
type UserRole = "Learner" | "Admin";

interface ManagedUser {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joined: string;
  lastActive: string;
  quizzesTaken: number;
  masteredWords: number;
  totalWords: number;
  completionRate: number;
  avatar: string;
}

interface ApiUser {
  id: number | string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  joinedAt: string;
  masteredWords: number;
  totalWords: number;
  totalAttempts: number;
  lastActiveAt: string | null;
}

const statusTone: Record<UserStatus, "emerald" | "rose"> = {
  active: "emerald",
  banned: "rose",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function mapUser(user: ApiUser): ManagedUser {
  const completionRate = user.totalWords > 0 ? Math.round((user.masteredWords / user.totalWords) * 100) : 0;

  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: user.role,
    status: user.isActive ? "active" : "banned",
    joined: formatDate(user.joinedAt),
    lastActive: formatDate(user.lastActiveAt),
    quizzesTaken: user.totalAttempts || 0,
    masteredWords: user.masteredWords || 0,
    totalWords: user.totalWords || 0,
    completionRate,
    avatar: getInitials(user.fullName),
  };
}

export default function AdminStudents() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pageSize = 4;

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await adminService.getStudents();
      const mapped: ManagedUser[] = data.map((user: ApiUser) => mapUser(user));
      setUsers(mapped);
      setSelectedUser((current) => {
        if (!mapped.length) return null;
        return mapped.find((user) => user.id === current?.id) || mapped[0];
      });
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Khong the tai danh sach user");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesQuery = `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || user.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [users, query, status]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const activeUsers = users.filter((user) => user.status === "active").length;
  const bannedUsers = users.length - activeUsers;
  const learners = users.filter((user) => user.role === "Learner").length;
  const admins = users.filter((user) => user.role === "Admin").length;

  async function toggleStatus(user: ManagedUser) {
    try {
      await adminService.toggleStudentStatus(user.id);
      await fetchUsers();
      toast.success("Cap nhat trang thai user thanh cong");
    } catch (error) {
      console.error("Failed to update user status", error);
      toast.error("Cap nhat trang thai that bai");
    }
  }

  async function updateRole(id: number | string, role: UserRole) {
    try {
      await adminService.updateStudentRole(id, role);
      await fetchUsers();
      toast.success("Cap nhat vai tro user thanh cong");
    } catch (error) {
      console.error("Failed to update user role", error);
      toast.error("Cap nhat vai tro that bai");
    }
  }

  return (
    <>
      <Topbar title="User management" subtitle="Manage real accounts from ToeicVocabularyPlatform." role="admin" userName="Admin" />

      <AdminPage>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total users" value={users.length.toString()} change="From database" icon={Users} tone="blue" />
          <KpiCard label="Active users" value={activeUsers.toString()} change={`${bannedUsers} banned`} icon={UserCheck} tone="emerald" />
          <KpiCard label="Learners" value={learners.toString()} change="UserRole = Learner" icon={Users} tone="violet" />
          <KpiCard label="Admins" value={admins.toString()} change="UserRole = Admin" icon={Shield} tone="amber" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <AdminPanel>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex h-10 flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 dark:border-white/10 dark:bg-white/5">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search name, email, or role"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Filter className="h-4 w-4" />Status
                  </span>
                  {(["all", "active", "banned"] as const).map((item) => (
                    <ToolbarButton key={item} active={status === item} onClick={() => { setStatus(item); setPage(1); }}>
                      {item}
                    </ToolbarButton>
                  ))}
                </div>
              </div>
            </AdminPanel>

            <TableShell>
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Activity</th>
                    <th className="px-4 py-3 font-medium">Mastery</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                        Loading users from database...
                      </td>
                    </tr>
                  ) : visibleUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                        No users found.
                      </td>
                    </tr>
                  ) : visibleUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">{user.avatar}</div>
                          <div>
                            <p className="font-medium text-slate-950 dark:text-white">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{user.role}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Joined {user.joined}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        <p>{user.quizzesTaken.toLocaleString()} attempts</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Last active: {user.lastActive}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-2 w-28 rounded-full bg-slate-100 dark:bg-white/10">
                          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${user.completionRate}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {user.masteredWords}/{user.totalWords} words
                        </p>
                      </td>
                      <td className="px-4 py-4"><StatusBadge tone={statusTone[user.status]}>{user.status}</StatusBadge></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <IconButton label="View profile" onClick={() => setSelectedUser(user)}><Eye className="h-4 w-4" /></IconButton>
                          {user.status === "banned" ? (
                            <IconButton label="Unban user" tone="emerald" onClick={() => toggleStatus(user)}><Shield className="h-4 w-4" /></IconButton>
                          ) : (
                            <IconButton label="Ban user" tone="rose" onClick={() => toggleStatus(user)}><Ban className="h-4 w-4" /></IconButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                <p className="text-sm text-slate-500 dark:text-slate-400">Showing {visibleUsers.length} of {filteredUsers.length} users</p>
                <div className="flex items-center gap-2">
                  <IconButton label="Previous page" onClick={() => setPage(Math.max(1, page - 1))}><ChevronLeft className="h-4 w-4" /></IconButton>
                  <span className="text-sm text-slate-600 dark:text-slate-300">Page {page} of {totalPages}</span>
                  <IconButton label="Next page" onClick={() => setPage(Math.min(totalPages, page + 1))}><ChevronRight className="h-4 w-4" /></IconButton>
                </div>
              </div>
            </TableShell>
          </div>

          <AdminPanel title="User profile" description="Account data loaded from the database.">
            {selectedUser ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">{selectedUser.avatar}</div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-slate-950 dark:text-white">{selectedUser.name}</h2>
                    <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"><Mail className="h-3.5 w-3.5" />{selectedUser.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge tone={statusTone[selectedUser.status]}>{selectedUser.status}</StatusBadge>
                      <StatusBadge tone="blue">{selectedUser.role}</StatusBadge>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-slate-200 p-3 dark:border-white/10">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Attempts</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{selectedUser.quizzesTaken}</p>
                  </div>
                  <div className="rounded-md border border-slate-200 p-3 dark:border-white/10">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Mastery</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{selectedUser.completionRate}%</p>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Assign role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(event) => updateRole(selectedUser.id, event.target.value as UserRole)}
                    className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
                  >
                    {(["Learner", "Admin"] as const).map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>

                <div className="mt-5 flex gap-2">
                  {selectedUser.status === "banned" ? (
                    <ToolbarButton onClick={() => toggleStatus(selectedUser)}><Shield className="h-4 w-4" />Unban</ToolbarButton>
                  ) : (
                    <ToolbarButton onClick={() => toggleStatus(selectedUser)}><ShieldOff className="h-4 w-4" />Ban</ToolbarButton>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No user selected.</p>
            )}
          </AdminPanel>
        </div>
      </AdminPage>
    </>
  );
}
