"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Topbar from "@/src/components/shared/Topbar";
import { adminService } from "@/src/services/admin.service";
import type { PaginationMeta, UserMutationPayload } from "@/src/services/admin.service";
import { adminLabel } from "@/src/lib/admin-i18n";
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
  Edit,
  Eye,
  Filter,
  Mail,
  Plus,
  Save,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";

type UserStatus = "active" | "banned";
type UserRole = "Learner" | "Admin" | "ContentCreator";
type PanelMode = "view" | "create" | "edit";

interface ManagedUser {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;
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

interface UserFormState {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

const emptyForm: UserFormState = {
  fullName: "",
  email: "",
  password: "",
  role: "Learner",
  isActive: true,
};

const statusTone: Record<UserStatus, "emerald" | "rose"> = {
  active: "emerald",
  banned: "rose",
};

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function formatDate(value: string | null) {
  if (!value) return "Chưa từng";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function mapUser(user: ApiUser): ManagedUser {
  const completionRate = user.totalWords > 0 ? Math.round((user.masteredWords / user.totalWords) * 100) : 0;
  const fullName = user.fullName || "Người dùng chưa đặt tên";

  return {
    id: user.id,
    name: fullName,
    email: user.email,
    role: user.role,
    status: user.isActive ? "active" : "banned",
    isActive: user.isActive,
    joined: formatDate(user.joinedAt),
    lastActive: formatDate(user.lastActiveAt),
    quizzesTaken: user.totalAttempts || 0,
    masteredWords: user.masteredWords || 0,
    totalWords: user.totalWords || 0,
    completionRate,
    avatar: getInitials(fullName),
  };
}

function toFormState(user: ManagedUser): UserFormState {
  return {
    fullName: user.name,
    email: user.email,
    password: "",
    role: user.role,
    isActive: user.isActive,
  };
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as { response?: { data?: { message?: unknown } } };
  return typeof apiError.response?.data?.message === "string" ? apiError.response.data.message : fallback;
}

export default function AdminStudents() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("view");
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const pageSize = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getStudentsPage<ApiUser>({
        page,
        limit: pageSize,
        search: query.trim(),
        status,
      });
      const mapped: ManagedUser[] = data.items.map((user: ApiUser) => mapUser(user));
      setPagination(data.pagination);
      setUsers(mapped);
      setSelectedUser((current) => {
        if (!mapped.length) return null;
        return mapped.find((user) => user.id === current?.id) || mapped[0];
      });
      return mapped;
    } catch (error) {
      console.error("Không thể tải người dùng", error);
      toast.error("Không thể tải danh sách người dùng");
      return [];
    } finally {
      setLoading(false);
    }
  }, [page, query, status]);

  useEffect(() => {
    void Promise.resolve().then(fetchUsers);
  }, [fetchUsers]);

  const totalPages = pagination?.totalPages ?? 1;
  const visibleUsers = users;
  const activeUsers = users.filter((user) => user.status === "active").length;
  const bannedUsers = users.length - activeUsers;
  const learners = users.filter((user) => user.role === "Learner").length;
  const admins = users.filter((user) => user.role === "Admin").length;
  const creators = users.filter((user) => user.role === "ContentCreator").length;

  function openCreateForm() {
    setPanelMode("create");
    setSelectedUser(null);
    setForm(emptyForm);
  }

  function openEditForm(user: ManagedUser) {
    setPanelMode("edit");
    setSelectedUser(user);
    setForm(toFormState(user));
  }

  function openProfile(user: ManagedUser) {
    setPanelMode("view");
    setSelectedUser(user);
  }

  function validateForm() {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error("Vui lòng nhập họ tên và email");
      return false;
    }

    if (panelMode === "create" && form.password.length < 6) {
      toast.error("Mật khẩu cần tối thiểu 6 ký tự");
      return false;
    }

    if (panelMode === "edit" && form.password && form.password.length < 6) {
      toast.error("Mật khẩu mới cần tối thiểu 6 ký tự");
      return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload: UserMutationPayload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        role: form.role,
        isActive: form.isActive,
        ...(form.password ? { password: form.password } : {}),
      };

      if (panelMode === "create") {
        const response = await adminService.createStudent({ ...payload, password: form.password });
        const mapped = await fetchUsers();
        setSelectedUser(mapped.find((user) => user.id === response.data?.id) || mapped[0] || null);
        toast.success("Tạo người dùng thành công");
      } else if (panelMode === "edit" && selectedUser) {
        await adminService.updateStudent(selectedUser.id, payload);
        const mapped = await fetchUsers();
        setSelectedUser(mapped.find((user) => user.id === selectedUser.id) || null);
        toast.success("Cập nhật người dùng thành công");
      }

      setPanelMode("view");
      setForm(emptyForm);
    } catch (error: unknown) {
      console.error("Không thể lưu người dùng", error);
      toast.error(getApiErrorMessage(error, "Lưu người dùng thất bại"));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(user: ManagedUser) {
    try {
      await adminService.toggleStudentStatus(user.id);
      await fetchUsers();
      toast.success("Cập nhật trạng thái người dùng thành công");
    } catch (error) {
      console.error("Không thể cập nhật trạng thái người dùng", error);
      toast.error("Cập nhật trạng thái thất bại");
    }
  }

  async function updateRole(id: number | string, role: UserRole) {
    try {
      await adminService.updateStudentRole(id, role);
      await fetchUsers();
      toast.success("Cập nhật vai trò người dùng thành công");
    } catch (error) {
      console.error("Không thể cập nhật vai trò người dùng", error);
      toast.error("Cập nhật vai trò thất bại");
    }
  }

  async function deleteUser(user: ManagedUser) {
    if (!window.confirm(`Xóa người dùng ${user.email}?`)) return;

    try {
      await adminService.deleteStudent(user.id);
      const mapped = await fetchUsers();
      setSelectedUser(mapped[0] || null);
      setPanelMode("view");
      toast.success("Xóa người dùng thành công");
    } catch (error: unknown) {
      console.error("Không thể xóa người dùng", error);
      toast.error(getApiErrorMessage(error, "Xóa người dùng thất bại"));
    }
  }

  return (
    <>
      <Topbar title="Quản lý người dùng" subtitle="Quản lý tài khoản thực tế trong hệ thống ToeicVocabularyPlatform." role="admin" />

      <AdminPage>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Tổng người dùng" value={String(pagination?.total ?? users.length)} change="Từ cơ sở dữ liệu" icon={Users} tone="blue" />
          <KpiCard label="Đang hoạt động" value={activeUsers.toString()} change={`${bannedUsers} tài khoản đã khóa trên trang`} icon={UserCheck} tone="emerald" />
          <KpiCard label="Học viên" value={learners.toString()} change={`${creators} biên tập viên trên trang`} icon={Users} tone="violet" />
          <KpiCard label="Quản trị viên" value={admins.toString()} change="Vai trò quản trị trên trang" icon={Shield} tone="amber" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-4">
            <AdminPanel>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex h-10 flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 dark:border-white/10 dark:bg-white/5">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Tìm họ tên, email hoặc vai trò"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-500 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Filter className="h-4 w-4" />Trạng thái
                  </span>
                  {(["all", "active", "banned"] as const).map((item) => (
                    <ToolbarButton key={item} active={status === item} onClick={() => { setStatus(item); setPage(1); }}>
                      {item === "all" ? "Tất cả" : adminLabel(item)}
                    </ToolbarButton>
                  ))}
                  <ToolbarButton onClick={openCreateForm}>
                    <Plus className="h-4 w-4" />
                    Thêm người dùng
                  </ToolbarButton>
                </div>
              </div>
            </AdminPanel>

            <TableShell>
              <table className="w-full min-w-[940px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase tracking-wide text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Người dùng</th>
                    <th className="px-4 py-3 font-medium">Vai trò</th>
                    <th className="px-4 py-3 font-medium">Hoạt động</th>
                    <th className="px-4 py-3 font-medium">Mức thành thạo</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                    <th className="px-4 py-3 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                        Đang tải người dùng từ cơ sở dữ liệu...
                      </td>
                    </tr>
                  ) : visibleUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                        Không tìm thấy người dùng.
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
                        <p className="font-medium text-slate-800 dark:text-slate-200">{adminLabel(user.role)}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tham gia {user.joined}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        <p>{user.quizzesTaken.toLocaleString("vi-VN")} lượt làm</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Hoạt động gần nhất: {user.lastActive}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-2 w-28 rounded-full bg-slate-100 dark:bg-white/10">
                          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${user.completionRate}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {user.masteredWords}/{user.totalWords} từ
                        </p>
                      </td>
                      <td className="px-4 py-4"><StatusBadge tone={statusTone[user.status]}>{adminLabel(user.status)}</StatusBadge></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <IconButton label="Xem hồ sơ" onClick={() => openProfile(user)}><Eye className="h-4 w-4" /></IconButton>
                          <IconButton label="Sửa người dùng" onClick={() => openEditForm(user)}><Edit className="h-4 w-4" /></IconButton>
                          {user.status === "banned" ? (
                            <IconButton label="Mở khóa người dùng" tone="emerald" onClick={() => toggleStatus(user)}><Shield className="h-4 w-4" /></IconButton>
                          ) : (
                            <IconButton label="Khóa người dùng" tone="rose" onClick={() => toggleStatus(user)}><Ban className="h-4 w-4" /></IconButton>
                          )}
                          <IconButton label="Xóa người dùng" tone="rose" onClick={() => deleteUser(user)}><Trash2 className="h-4 w-4" /></IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                <p className="text-sm text-slate-500 dark:text-slate-400">Hiển thị {visibleUsers.length} / {pagination?.total ?? visibleUsers.length} người dùng</p>
                <div className="flex items-center gap-2">
                  <IconButton label="Trang trước" onClick={() => setPage(Math.max(1, page - 1))}><ChevronLeft className="h-4 w-4" /></IconButton>
                  <span className="text-sm text-slate-600 dark:text-slate-300">Trang {page} / {totalPages}</span>
                  <IconButton label="Trang sau" onClick={() => setPage(Math.min(totalPages, page + 1))}><ChevronRight className="h-4 w-4" /></IconButton>
                </div>
              </div>
            </TableShell>
          </div>

          <AdminPanel
            title={panelMode === "create" ? "Tạo người dùng" : panelMode === "edit" ? "Sửa người dùng" : "Hồ sơ người dùng"}
            description={panelMode === "view" ? "Dữ liệu tài khoản được tải từ cơ sở dữ liệu." : "Họ tên, email, vai trò, trạng thái và mật khẩu."}
          >
            {panelMode === "create" || panelMode === "edit" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Họ và tên</label>
                  <input
                    value={form.fullName}
                    onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                    className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {panelMode === "create" ? "Mật khẩu" : "Mật khẩu mới"}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder={panelMode === "edit" ? "Để trống nếu muốn giữ mật khẩu hiện tại" : ""}
                    className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Vai trò</label>
                    <select
                      value={form.role}
                      onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}
                      className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
                    >
                      {(["Learner", "ContentCreator", "Admin"] as const).map((role) => <option key={role} value={role}>{adminLabel(role)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Trạng thái</label>
                    <select
                      value={form.isActive ? "active" : "banned"}
                      onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === "active" }))}
                      className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
                    >
                      <option value="active">Đang hoạt động</option>
                      <option value="banned">Đã khóa</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-950 bg-slate-950 px-3 text-sm font-medium text-white transition-colors disabled:opacity-60 dark:border-white dark:bg-white dark:text-slate-950"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Đang lưu..." : "Lưu"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPanelMode("view");
                      setForm(emptyForm);
                    }}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                    Hủy
                  </button>
                </div>
              </form>
            ) : selectedUser ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">{selectedUser.avatar}</div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-slate-950 dark:text-white">{selectedUser.name}</h2>
                    <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"><Mail className="h-3.5 w-3.5" />{selectedUser.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge tone={statusTone[selectedUser.status]}>{adminLabel(selectedUser.status)}</StatusBadge>
                      <StatusBadge tone="blue">{adminLabel(selectedUser.role)}</StatusBadge>
                    </div>
                  </div>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-slate-200 py-4 dark:border-white/10">
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Lượt làm</dt>
                    <dd className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{selectedUser.quizzesTaken}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Mức thành thạo</dt>
                    <dd className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{selectedUser.completionRate}%</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Ngày tham gia</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{selectedUser.joined}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Hoạt động gần nhất</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{selectedUser.lastActive}</dd>
                  </div>
                </dl>

                <div className="mt-5">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Gán vai trò</label>
                  <select
                    value={selectedUser.role}
                    onChange={(event) => updateRole(selectedUser.id, event.target.value as UserRole)}
                    className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
                  >
                    {(["Learner", "ContentCreator", "Admin"] as const).map((role) => <option key={role} value={role}>{adminLabel(role)}</option>)}
                  </select>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <ToolbarButton onClick={() => openEditForm(selectedUser)}><Edit className="h-4 w-4" />Sửa</ToolbarButton>
                  {selectedUser.status === "banned" ? (
                    <ToolbarButton onClick={() => toggleStatus(selectedUser)}><Shield className="h-4 w-4" />Mở khóa</ToolbarButton>
                  ) : (
                    <ToolbarButton onClick={() => toggleStatus(selectedUser)}><ShieldOff className="h-4 w-4" />Khóa</ToolbarButton>
                  )}
                  <ToolbarButton onClick={() => deleteUser(selectedUser)}><Trash2 className="h-4 w-4" />Xóa</ToolbarButton>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Chưa chọn người dùng.</p>
            )}
          </AdminPanel>
        </div>
      </AdminPage>
    </>
  );
}
