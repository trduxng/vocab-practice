"use client";

import Topbar from "@/src/components/shared/Topbar";
import ChartFrame from "@/src/components/admin/ChartFrame";
import {
  AdminPage,
  AdminPanel,
  KpiCard,
  StatusBadge,
  chartColors,
} from "@/src/components/admin/AdminPrimitives";
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  Clock3,
  PieChart as PieChartIcon,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const kpis = [
  { label: "Total users", value: "128,420", change: "+12.8% vs last month", icon: Users, tone: "blue" as const },
  { label: "Daily active users", value: "18,742", change: "+7.1% today", icon: Activity, tone: "emerald" as const },
  { label: "New signups", value: "2,184", change: "+438 this week", icon: UserPlus, tone: "violet" as const },
  { label: "Quizzes taken", value: "842,910", change: "+18.4% vs last month", icon: ClipboardList, tone: "amber" as const },
  { label: "Completion rate", value: "74.6%", change: "-1.2% vs target", trend: "down" as const, icon: CheckCircle2, tone: "rose" as const },
];

const userGrowth = [
  { date: "Apr 01", users: 101000 },
  { date: "Apr 05", users: 104800 },
  { date: "Apr 09", users: 109200 },
  { date: "Apr 13", users: 113900 },
  { date: "Apr 17", users: 118300 },
  { date: "Apr 21", users: 123600 },
  { date: "Apr 25", users: 128420 },
];

const quizActivity = [
  { day: "Mon", quizzes: 17800, flashcards: 25600 },
  { day: "Tue", quizzes: 21400, flashcards: 28100 },
  { day: "Wed", quizzes: 23600, flashcards: 30900 },
  { day: "Thu", quizzes: 19800, flashcards: 27600 },
  { day: "Fri", quizzes: 25100, flashcards: 32600 },
  { day: "Sat", quizzes: 29200, flashcards: 38100 },
  { day: "Sun", quizzes: 26400, flashcards: 34700 },
];

const userTypes = [
  { name: "Free learners", value: 58, color: chartColors.blue },
  { name: "Premium", value: 24, color: chartColors.emerald },
  { name: "Teachers", value: 12, color: chartColors.amber },
  { name: "Schools", value: 6, color: chartColors.violet },
];

const recentActivity = [
  { title: "IELTS Vocabulary Sprint passed moderation", detail: "Published by Linh Tran", time: "4 min ago", tone: "emerald" as const },
  { title: "14 reports opened for duplicate flashcards", detail: "Content team queue", time: "18 min ago", tone: "amber" as const },
  { title: "Premium plan conversion spike detected", detail: "Starter plan trial cohort", time: "41 min ago", tone: "blue" as const },
  { title: "User ban appeal requires review", detail: "Policy violation: spam", time: "1 hr ago", tone: "rose" as const },
];

const tooltipStyle = {
  background: "rgb(15 23 42)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 8,
  color: "white",
};

export default function AdminDashboard() {
  return (
    <>
      <Topbar
        title="Overview"
        subtitle="Live operating snapshot for users, study activity, content quality, and growth."
        role="admin"
        userName="Admin"
      />

      <AdminPage>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <AdminPanel
            title="User growth"
            description="Cumulative accounts over the current month."
            className="xl:col-span-2"
            action={<StatusBadge tone="blue"><Sparkles className="mr-1 h-3 w-3" />Healthy growth</StatusBadge>}
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
                  <Area type="monotone" dataKey="users" stroke={chartColors.blue} strokeWidth={2} fill="url(#users)" name="Total users" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartFrame>
          </AdminPanel>

          <AdminPanel title="User types" description="Active user mix by account segment." action={<PieChartIcon className="h-4 w-4 text-slate-400" />}>
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
                  <span className="font-medium text-slate-950 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <AdminPanel title="Quiz activity" description="Quizzes and flashcard study sessions by weekday." className="xl:col-span-2">
            <ChartFrame className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} width={48} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="quizzes" fill={chartColors.blue} radius={[6, 6, 0, 0]} name="Quizzes" />
                  <Bar dataKey="flashcards" fill={chartColors.emerald} radius={[6, 6, 0, 0]} name="Flashcards" />
                </BarChart>
              </ResponsiveContainer>
            </ChartFrame>
          </AdminPanel>

          <AdminPanel title="Recent activity" description="Latest events requiring attention.">
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                    <Clock3 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-slate-950 dark:text-white">{item.title}</p>
                      <StatusBadge tone={item.tone}>{item.time}</StatusBadge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>
      </AdminPage>
    </>
  );
}
