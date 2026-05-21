"use client";

import { useEffect, useMemo, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import ChartFrame from "@/src/components/admin/ChartFrame";
import { AdminPage, AdminPanel, KpiCard, StatusBadge, chartColors } from "@/src/components/admin/AdminPrimitives";
import { adminService } from "@/src/services/admin.service";
import { Activity, CheckCircle2, ClipboardList, Clock3, PieChart as PieChartIcon, Sparkles, Users } from "lucide-react";
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

function compactNumber(value?: number | null) {
  return Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));
}

function formatRelative(value?: string) {
  if (!value) return "No activity";
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} days ago`;
}

function formatUptime(seconds?: number) {
  const total = Number(seconds || 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const data = await adminService.getStats();
        if (!cancelled) setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const userGrowth = useMemo(() => {
    return (stats?.userGrowth || []).reduce<Array<{ date: string; users: number }>>((items, item) => {
      const previous = items.at(-1)?.users || 0;
      return [...items, { date: item.date?.slice(5) || "", users: previous + Number(item.users || 0) }];
    }, []);
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
      <Topbar title="Overview" subtitle="Live data from ToeicVocabularyPlatform." role="admin" userName="Admin" />

      <AdminPage>
        {loading ? (
          <AdminPanel>
            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Loading admin data...</div>
          </AdminPanel>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <KpiCard label="Total users" value={compactNumber(stats?.totalUsers)} change={`${compactNumber(stats?.totalCreators)} creators`} icon={Users} tone="blue" />
              <KpiCard label="Active today" value={compactNumber(stats?.activeUsersToday)} change="Unique learners in 24h" icon={Activity} tone="emerald" />
              <KpiCard label="Pending reviews" value={compactNumber(stats?.pendingReviews)} change="Creator submissions" trend="down" icon={Clock3} tone="amber" />
              <KpiCard label="Published topics" value={compactNumber(stats?.publishedTopics)} change={`${compactNumber(stats?.totalWords)} words`} icon={ClipboardList} tone="violet" />
              <KpiCard label="Total quizzes" value={compactNumber(stats?.totalMiniTests)} change={`${compactNumber(stats?.totalQuestions)} questions`} icon={CheckCircle2} tone="rose" />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <AdminPanel
                title="User growth"
                description="New accounts by date from the Users table."
                className="xl:col-span-2"
                action={<StatusBadge tone="blue"><Sparkles className="mr-1 h-3 w-3" />Live database</StatusBadge>}
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
                      <Area type="monotone" dataKey="users" stroke={chartColors.blue} strokeWidth={2} fill="url(#users)" name="New users" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartFrame>
              </AdminPanel>

              <AdminPanel title="User roles" description="Current account mix by role." action={<PieChartIcon className="h-4 w-4 text-slate-400" />}>
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
                        {item.name}
                      </span>
                      <span className="font-medium text-slate-950 dark:text-white">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </AdminPanel>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <AdminPanel title="Study activity" description="Exercise attempts and correct answers by day." className="xl:col-span-2">
                <ChartFrame className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} width={48} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="attempts" fill={chartColors.blue} radius={[6, 6, 0, 0]} name="Attempts" />
                      <Bar dataKey="correct" fill={chartColors.emerald} radius={[6, 6, 0, 0]} name="Correct" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartFrame>
              </AdminPanel>

              <AdminPanel title="Recent activity" description="Latest exercise attempts.">
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No recent exercise activity.</p>
                  ) : recentActivity.map((item) => (
                    <div key={`${item.title}-${item.createdAt}`} className="flex gap-3">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                        <Clock3 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-slate-950 dark:text-white">{item.title}</p>
                          <StatusBadge tone={item.tone || "slate"}>{formatRelative(item.createdAt)}</StatusBadge>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminPanel>
            </div>

            <AdminPanel title="System health" description="Runtime status reported by the admin API.">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-md border border-slate-200 p-4 dark:border-white/10">
                  <p className="text-xs text-slate-500 dark:text-slate-400">API status</p>
                  <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">{stats?.systemHealth?.apiStatus || "Unknown"}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-4 dark:border-white/10">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Database</p>
                  <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">{stats?.systemHealth?.databaseStatus || "Unknown"}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-4 dark:border-white/10">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Environment</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{stats?.systemHealth?.environment || "development"}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-4 dark:border-white/10">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Uptime</p>
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
