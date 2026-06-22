"use client";

import { useEffect, useMemo, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import ChartFrame from "@/src/components/admin/ChartFrame";
import { AdminErrorState, AdminLoadingState, AdminPage, AdminPanel, KpiCard, StatusBadge, chartColors } from "@/src/components/admin/AdminPrimitives";
import { adminService } from "@/src/services/admin.service";
import { adminLabel, formatAdminNumber, translateAdminText } from "@/src/lib/admin-i18n";
import { Activity, BookOpen, CheckCircle2, ClipboardList, Clock3, FileQuestion, PieChart as PieChartIcon, Sparkles, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Tone = "slate" | "blue" | "emerald" | "amber" | "rose" | "violet";

type DashboardStats = {
  totalUsers?: number;
  totalStudents?: number;
  totalCreators?: number;
  totalWords?: number;
  totalTopics?: number;
  publishedTopics?: number;
  totalQuestions?: number;
  totalAttempts?: number;
  totalMiniTests?: number;
  pendingReviews?: number;
  masteredRecords?: number;
  dueReviews?: number;
  newUsersThisWeek?: number;
  activeUsersToday?: number;
  averageAccuracy?: number | null;
  userGrowth?: Array<{ date: string; users: number }>;
  weeklyActivity?: Array<{ day: string; attempts: number; correct: number }>;
  userTypes?: Array<{ name: string; value: number }>;
  recentActivity?: Array<{ title: string; detail: string; createdAt: string; tone: Tone }>;
  systemHealth?: {
    apiStatus?: string;
    databaseStatus?: string;
    environment?: string;
    uptimeSeconds?: number;
  };
};

const tooltipStyle = {
  background: "rgb(15 23 42)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 8,
  color: "white",
};

const roleColors = [chartColors.blue, chartColors.emerald, chartColors.amber, chartColors.violet, chartColors.rose];

function formatRelative(value?: string) {
  if (!value) return "Chưa có hoạt động";
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.round(hours / 24)} ngày trước`;
}

function formatUptime(seconds?: number) {
  const total = Number(seconds || 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0) return `${hours} giờ ${minutes} phút`;
  return `${minutes} phút`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);
      setError("");
      try {
        const data = await adminService.getStats();
        if (!cancelled) setStats(data);
      } catch (error) {
        console.error("Không thể tải số liệu tổng quan", error);
        if (!cancelled) setError("API thống kê quản trị chưa phản hồi. Vui lòng thử lại.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [refreshIndex]);

  const userGrowth = useMemo(() => {
    return (stats?.userGrowth || []).map((item) => ({
      date: item.date?.slice(5) || "",
      users: Number(item.users || 0),
    }));
  }, [stats]);

  const userTypes = useMemo(() => {
    const total = (stats?.userTypes || []).reduce((sum, item) => sum + Number(item.value || 0), 0);
    return (stats?.userTypes || []).map((item, index) => ({
      ...item,
      color: roleColors[index % roleColors.length],
      percent: total ? Math.round((Number(item.value || 0) / total) * 100) : 0,
    }));
  }, [stats]);

  const weeklyActivity = stats?.weeklyActivity || [];
  const recentActivity = stats?.recentActivity || [];

  return (
    <>
      <Topbar title="Tổng quan" subtitle="Dữ liệu trực tiếp từ hệ thống ToeicVocabularyPlatform." role="admin" />

      <AdminPage>
        {loading ? (
          <AdminLoadingState label="Đang tải dữ liệu quản trị..." />
        ) : error ? (
          <AdminErrorState description={error} onRetry={() => setRefreshIndex((value) => value + 1)} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Tổng người dùng" value={formatAdminNumber(stats?.totalUsers)} change={`${formatAdminNumber(stats?.totalCreators)} biên tập viên`} icon={Users} tone="blue" />
              <KpiCard label="Tổng từ vựng" value={formatAdminNumber(stats?.totalWords)} change="Kho từ vựng hiện có" icon={BookOpen} tone="emerald" />
              <KpiCard label="Tổng chủ đề" value={formatAdminNumber(stats?.totalTopics)} change={`${formatAdminNumber(stats?.publishedTopics)} đã xuất bản`} icon={ClipboardList} tone="violet" />
              <KpiCard label="Tổng câu hỏi" value={formatAdminNumber(stats?.totalQuestions)} change="Ngân hàng câu hỏi" icon={FileQuestion} tone="amber" />
              <KpiCard label="Tổng mini test" value={formatAdminNumber(stats?.totalMiniTests)} change="Bài kiểm tra trong hệ thống" icon={CheckCircle2} tone="rose" />
              <KpiCard label="Người dùng mới" value={formatAdminNumber(stats?.newUsersThisWeek)} change="Trong 7 ngày gần nhất" icon={Sparkles} tone="blue" />
              <KpiCard label="Đang hoạt động" value={formatAdminNumber(stats?.activeUsersToday)} change="Học viên duy nhất trong 24 giờ" icon={Activity} tone="emerald" />
              <KpiCard label="Nội dung chờ duyệt" value={formatAdminNumber(stats?.pendingReviews)} change="Cần quản trị viên xử lý" trend="down" icon={Clock3} tone="amber" />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <AdminPanel
                title="Tăng trưởng người dùng"
                description="Số tài khoản mới theo ngày từ dữ liệu người dùng."
                className="xl:col-span-2"
                action={<StatusBadge tone="blue"><Sparkles className="mr-1 h-3 w-3" />Dữ liệu trực tiếp</StatusBadge>}
              >
                <ChartFrame className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowth}>
                      <defs>
                        <linearGradient id="users" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor={chartColors.blue} stopOpacity={0.28} />
                          <stop offset="100%" stopColor={chartColors.blue} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} width={48} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="users" stroke={chartColors.blue} strokeWidth={2} fill="url(#users)" name="Người dùng mới" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartFrame>
              </AdminPanel>

              <AdminPanel title="Vai trò người dùng" description="Tỷ lệ tài khoản hiện tại theo vai trò." action={<PieChartIcon className="h-4 w-4 text-slate-400" />}>
                <ChartFrame className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={userTypes} dataKey="value" innerRadius={52} outerRadius={88} paddingAngle={4}>
                        {userTypes.map((item) => <Cell key={item.name} fill={item.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartFrame>
                <div className="space-y-2">
                  {userTypes.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {adminLabel(item.name)}
                      </span>
                      <span className="font-medium text-slate-950 dark:text-white">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </AdminPanel>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <AdminPanel title="Hoạt động học tập" description="Số lượt làm bài và trả lời đúng theo ngày." className="xl:col-span-2">
                <ChartFrame className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} width={48} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="attempts" fill={chartColors.blue} radius={[6, 6, 0, 0]} name="Lượt làm" />
                      <Bar dataKey="correct" fill={chartColors.emerald} radius={[6, 6, 0, 0]} name="Trả lời đúng" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartFrame>
              </AdminPanel>

              <AdminPanel title="Hoạt động gần đây" description="Các lượt làm bài mới nhất.">
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có hoạt động làm bài gần đây.</p>
                  ) : recentActivity.map((item) => (
                    <div key={`${item.title}-${item.createdAt}`} className="flex gap-3">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">
                        <Clock3 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-slate-950 dark:text-white">{translateAdminText(item.title)}</p>
                          <StatusBadge tone={item.tone || "slate"}>{formatRelative(item.createdAt)}</StatusBadge>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{translateAdminText(item.detail)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminPanel>
            </div>

            <AdminPanel title="Tình trạng hệ thống" description="Trạng thái vận hành do API quản trị báo cáo.">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-md border border-slate-200 p-4 dark:border-white/10">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Trạng thái API</p>
                  <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">{adminLabel(stats?.systemHealth?.apiStatus)}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-4 dark:border-white/10">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Cơ sở dữ liệu</p>
                  <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">{adminLabel(stats?.systemHealth?.databaseStatus)}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-4 dark:border-white/10">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Môi trường</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{adminLabel(stats?.systemHealth?.environment || "development")}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-4 dark:border-white/10">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Thời gian hoạt động</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{formatUptime(stats?.systemHealth?.uptimeSeconds)}</p>
                </div>
              </div>
            </AdminPanel>
          </>
        )}
      </AdminPage>
    </>
  );
}
