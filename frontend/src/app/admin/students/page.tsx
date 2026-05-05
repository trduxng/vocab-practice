"use client";

import { useMemo, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
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
  GraduationCap,
  Mail,
  Search,
  Shield,
  ShieldOff,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";

type UserStatus = "active" | "banned" | "review";
type UserRole = "Learner" | "Teacher" | "Moderator" | "Admin";

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  plan: "Free" | "Premium" | "School";
  joined: string;
  lastActive: string;
  quizzesTaken: number;
  completionRate: number;
  avatar: string;
  history: string[];
}

const users: ManagedUser[] = [
  { id: "U-1042", name: "Maya Chen", email: "maya.chen@example.com", role: "Learner", status: "active", plan: "Premium", joined: "Apr 2, 2026", lastActive: "6 min ago", quizzesTaken: 482, completionRate: 88, avatar: "MC", history: ["Completed TOEIC phrasal verbs", "Renewed Premium plan", "Created 2 private sets"] },
  { id: "U-1188", name: "Nam Tran", email: "nam.tran@example.com", role: "Teacher", status: "review", plan: "School", joined: "Mar 18, 2026", lastActive: "24 min ago", quizzesTaken: 126, completionRate: 71, avatar: "NT", history: ["Reported by 3 users", "Uploaded IELTS writing quiz", "Invited 42 learners"] },
  { id: "U-1227", name: "Sofia Patel", email: "sofia.patel@example.com", role: "Moderator", status: "active", plan: "Premium", joined: "Feb 11, 2026", lastActive: "1 hr ago", quizzesTaken: 614, completionRate: 93, avatar: "SP", history: ["Resolved 18 reports", "Edited duplicate flashcard tags", "Passed moderation audit"] },
  { id: "U-1304", name: "Alex Brown", email: "alex.brown@example.com", role: "Learner", status: "banned", plan: "Free", joined: "Jan 27, 2026", lastActive: "5 days ago", quizzesTaken: 39, completionRate: 42, avatar: "AB", history: ["Banned for spam links", "Appeal submitted", "Flagged by automated review"] },
  { id: "U-1391", name: "Linh Nguyen", email: "linh.nguyen@example.com", role: "Learner", status: "active", plan: "Free", joined: "Apr 22, 2026", lastActive: "2 min ago", quizzesTaken: 73, completionRate: 64, avatar: "LN", history: ["Joined Business English group", "Took placement test", "Saved 14 flashcards"] },
  { id: "U-1455", name: "Diego Rivera", email: "diego.rivera@example.com", role: "Admin", status: "active", plan: "School", joined: "Dec 3, 2025", lastActive: "Now", quizzesTaken: 208, completionRate: 79, avatar: "DR", history: ["Updated API key", "Exported billing report", "Assigned moderator role"] },
];

const statusTone: Record<UserStatus, "emerald" | "rose" | "amber"> = {
  active: "emerald",
  banned: "rose",
  review: "amber",
};

export default function AdminStudents() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<ManagedUser>(users[0]);
  const [localUsers, setLocalUsers] = useState(users);
  const pageSize = 4;

  const filteredUsers = useMemo(() => {
    return localUsers.filter((user) => {
      const matchesQuery = `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || user.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [localUsers, query, status]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  function updateStatus(id: string, nextStatus: UserStatus) {
    setLocalUsers((current) => current.map((user) => (user.id === id ? { ...user, status: nextStatus } : user)));
    setSelectedUser((current) => (current.id === id ? { ...current, status: nextStatus } : current));
  }

  function updateRole(id: string, role: UserRole) {
    setLocalUsers((current) => current.map((user) => (user.id === id ? { ...user, role } : user)));
    setSelectedUser((current) => (current.id === id ? { ...current, role } : current));
  }

  return (
    <>
      <Topbar title="User management" subtitle="Search accounts, review profiles, assign roles, and handle access controls." role="admin" userName="Admin" />

      <AdminPage>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total users" value="128,420" change="+12.8%" icon={Users} tone="blue" />
          <KpiCard label="Active learners" value="74,812" change="+5.4%" icon={UserCheck} tone="emerald" />
          <KpiCard label="New signups" value="2,184" change="+438 this week" icon={UserPlus} tone="violet" />
          <KpiCard label="Accounts in review" value="316" change="+42 pending" trend="down" icon={Shield} tone="amber" />
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
                  <span className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Filter className="h-4 w-4" />Status</span>
                  {(["all", "active", "review", "banned"] as const).map((item) => (
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
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Activity</th>
                    <th className="px-4 py-3 font-medium">Completion</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {visibleUsers.map((user) => (
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
                        <p className="font-medium text-slate-800 dark:text-slate-200">{user.plan}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        <p>{user.quizzesTaken.toLocaleString()} quizzes</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.lastActive}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-2 w-28 rounded-full bg-slate-100 dark:bg-white/10">
                          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${user.completionRate}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{user.completionRate}%</p>
                      </td>
                      <td className="px-4 py-4"><StatusBadge tone={statusTone[user.status]}>{user.status}</StatusBadge></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <IconButton label="View profile" onClick={() => setSelectedUser(user)}><Eye className="h-4 w-4" /></IconButton>
                          {user.status === "banned" ? (
                            <IconButton label="Unban user" tone="emerald" onClick={() => updateStatus(user.id, "active")}><Shield className="h-4 w-4" /></IconButton>
                          ) : (
                            <IconButton label="Ban user" tone="rose" onClick={() => updateStatus(user.id, "banned")}><Ban className="h-4 w-4" /></IconButton>
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

          <AdminPanel title="User profile" description="Account history and administrative controls.">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">{selectedUser.avatar}</div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">{selectedUser.name}</h2>
                <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"><Mail className="h-3.5 w-3.5" />{selectedUser.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge tone={statusTone[selectedUser.status]}>{selectedUser.status}</StatusBadge>
                  <StatusBadge tone="blue">{selectedUser.plan}</StatusBadge>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-md border border-slate-200 p-3 dark:border-white/10">
                <p className="text-xs text-slate-500 dark:text-slate-400">Quizzes</p>
                <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{selectedUser.quizzesTaken}</p>
              </div>
              <div className="rounded-md border border-slate-200 p-3 dark:border-white/10">
                <p className="text-xs text-slate-500 dark:text-slate-400">Completion</p>
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
                {(["Learner", "Teacher", "Moderator", "Admin"] as const).map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>

            <div className="mt-5 flex gap-2">
              {selectedUser.status === "banned" ? (
                <ToolbarButton onClick={() => updateStatus(selectedUser.id, "active")}><Shield className="h-4 w-4" />Unban</ToolbarButton>
              ) : (
                <ToolbarButton onClick={() => updateStatus(selectedUser.id, "banned")}><ShieldOff className="h-4 w-4" />Ban</ToolbarButton>
              )}
              <ToolbarButton onClick={() => updateStatus(selectedUser.id, "review")}><GraduationCap className="h-4 w-4" />Review</ToolbarButton>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Activity history</h3>
              <div className="mt-3 space-y-3">
                {selectedUser.history.map((item) => <div key={item} className="rounded-md border border-slate-200 p-3 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">{item}</div>)}
              </div>
            </div>
          </AdminPanel>
        </div>
      </AdminPage>
    </>
  );
}
