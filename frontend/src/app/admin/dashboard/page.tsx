// vocab-practice/frontend/src/app/admin/dashboard/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import apiClient from "@/src/lib/api-client";
import Topbar from "@/src/components/shared/Topbar";
import {
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  UserPlus,
  Star,
  Activity,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OverviewStats {
  totalStudents: number;
  totalStudentsChange: string;
  totalStudentsUp: boolean;
  monthlyRevenue: string;
  revenueChange: string;
  revenueUp: boolean;
  activeCourses: number;
  activeCoursesChange: string;
  activeCoursesUp: boolean;
  completionRate: number;
  completionRateChange: string;
  completionRateUp: boolean;
}

interface WeeklyActivityItem {
  day: string;
  users: number;
}

interface TodayActivity {
  newSignups: number;
  activeSessions: number;
  newReviews: number;
  revenue: string;
}

interface RecentUser {
  name: string;
  email: string;
  course: string;
  status: "active" | "inactive";
  joined: string;
  avatar: string;
  avatarColor: string;
}

interface TopCourse {
  name: string;
  students: number;
  revenue: string;
  rating: number;
  progress: number;
}

// ---------------------------------------------------------------------------
// API CALLS — thay các hàm này bằng fetch/axios thực tế
// ---------------------------------------------------------------------------

// GET /api/admin/overview-stats
// async function fetchOverviewStats(): Promise<OverviewStats | null> {
//   // return await api.get("/admin/overview-stats");
//   return null;
// }
async function fetchOverviewStats() {
  const response = await apiClient.get("/admin/overview-stats");
  return response.data;
}

// GET /api/admin/weekly-activity
// async function fetchWeeklyActivity(): Promise<WeeklyActivityItem[]> {
//   // return await api.get("/admin/weekly-activity");
//   return [];
// }
async function fetchWeeklyActivity() {
  const response = await apiClient.get("/admin/weekly-activity");
  return response.data;
}

// GET /api/admin/today-activity
// async function fetchTodayActivity(): Promise<TodayActivity | null> {
//   // return await api.get("/admin/today-activity");
//   return null;
// }
async function fetchTodayActivity() {
  const response = await apiClient.get("/admin/today-activity");
  return response.data;
}

// GET /api/admin/recent-users
// async function fetchRecentUsers(): Promise<RecentUser[]> {
//   // return await api.get("/admin/recent-users");
//   return [];
// }
async function fetchRecentUsers() {
  const response = await apiClient.get("/admin/recent-users");
  return response.data;
}

// GET /api/admin/top-courses
// async function fetchTopCourses(): Promise<TopCourse[]> {
//   // return await api.get("/admin/top-courses");
//   return [];
// }
async function fetchTopCourses() {
  const response = await apiClient.get("/admin/top-courses");
  return response.data;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AdminDashboard = () => {
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(
    null,
  );
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivityItem[]>(
    [],
  );
  const [todayActivity, setTodayActivity] = useState<TodayActivity | null>(
    null,
  );
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const [overview, weekly, today, users, courses] = await Promise.all([
        fetchOverviewStats(),
        fetchWeeklyActivity(),
        fetchTodayActivity(),
        fetchRecentUsers(),
        fetchTopCourses(),
      ]);

      if (overview) setOverviewStats(overview);
      if (weekly) setWeeklyActivity(weekly);
      if (today) setTodayActivity(today);
      if (users) setRecentUsers(users);
      if (courses) setTopCourses(courses);

      setLoading(false);
    }
    loadAll();
  }, []);

  // Stat cards — build từ API response
  // overviewStats: { totalStudents, totalStudentsChange, up,
  //                  monthlyRevenue, revenueChange, revenueUp,
  //                  activeCourses, activeCoursesChange, activeCoursesUp,
  //                  completionRate, completionRateChange, completionRateUp }
  const statCards = overviewStats
    ? [
        {
          label: "Tổng học viên",
          value: overviewStats.totalStudents.toLocaleString("vi-VN"),
          change: overviewStats.totalStudentsChange,
          up: overviewStats.totalStudentsUp,
          icon: Users,
          color: "from-blue-500 to-blue-600",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
        },
        {
          label: "Doanh thu tháng",
          value: overviewStats.monthlyRevenue,
          change: overviewStats.revenueChange,
          up: overviewStats.revenueUp,
          icon: DollarSign,
          color: "from-green-500 to-emerald-600",
          bg: "bg-green-500/10",
          border: "border-green-500/20",
        },
        {
          label: "Khóa học active",
          value: overviewStats.activeCourses.toLocaleString("vi-VN"),
          change: overviewStats.activeCoursesChange,
          up: overviewStats.activeCoursesUp,
          icon: BookOpen,
          color: "from-violet-500 to-purple-600",
          bg: "bg-violet-500/10",
          border: "border-violet-500/20",
        },
        {
          label: "Tỉ lệ hoàn thành",
          value: `${overviewStats.completionRate}%`,
          change: overviewStats.completionRateChange,
          up: overviewStats.completionRateUp,
          icon: TrendingUp,
          color: "from-amber-500 to-orange-500",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
        },
      ]
    : [];

  // Today activity cards — build từ API response
  // todayActivity: { newSignups, activeSessions, newReviews, revenue }
  const todayCards = todayActivity
    ? [
        {
          icon: UserPlus,
          label: "Đăng ký mới",
          value: todayActivity.newSignups.toLocaleString("vi-VN"),
          color: "text-blue-400",
          bg: "bg-blue-500/10",
        },
        {
          icon: Eye,
          label: "Lượt học",
          value: todayActivity.activeSessions.toLocaleString("vi-VN"),
          color: "text-violet-400",
          bg: "bg-violet-500/10",
        },
        {
          icon: Star,
          label: "Đánh giá mới",
          value: todayActivity.newReviews.toLocaleString("vi-VN"),
          color: "text-amber-400",
          bg: "bg-amber-500/10",
        },
        {
          icon: DollarSign,
          label: "Doanh thu",
          value: todayActivity.revenue,
          color: "text-green-400",
          bg: "bg-green-500/10",
        },
      ]
    : [];

  const maxUsers =
    weeklyActivity.length > 0
      ? Math.max(...weeklyActivity.map((d) => d.users))
      : 1;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <>
      <Topbar
        title="Tổng quan hệ thống"
        // subtitle nên lấy ngày hiện tại động thay vì hardcode
        subtitle={`Chào mừng trở lại, hôm nay là ${new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}`}
        role="admin"
        userName="Admin"
      />

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* ── Stat cards ── */}
        {statCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((s, i) => (
              <div
                key={i}
                className={`${s.bg} border ${s.border} rounded-2xl p-5 flex flex-col gap-3 hover:scale-[1.01] transition-transform cursor-default`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm font-medium">
                    {s.label}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl bg-linear-to-br ${s.color} flex items-center justify-center shadow-lg`}
                  >
                    <s.icon size={16} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-bold text-2xl">{s.value}</p>
                  <div
                    className={`flex items-center gap-1 mt-1 text-xs font-semibold ${s.up ? "text-green-400" : "text-red-400"}`}
                  >
                    {s.up ? (
                      <ArrowUpRight size={13} />
                    ) : (
                      <ArrowDownRight size={13} />
                    )}
                    {s.change} so với tháng trước
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-32 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center text-slate-600 text-sm">
            Chưa có dữ liệu tổng quan
          </div>
        )}

        {/* ── Chart + Today activity ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Weekly users chart */}
          <div className="xl:col-span-2 bg-white/3 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-bold">Người dùng trong tuần</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Lượt học tích cực theo ngày
                </p>
              </div>
              <div className="flex gap-2">
                {["Tuần", "Tháng", "Năm"].map((t, i) => (
                  <button
                    key={t}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      i === 0
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/6"
                    }`}
                    // onClick: gọi fetchWeeklyActivity với period tương ứng
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {weeklyActivity.length > 0 ? (
              /* weeklyActivity: [{ day: "T2", users: number }] */
              <div className="flex items-end gap-3 h-36">
                {weeklyActivity.map((d, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className="w-full relative flex items-end justify-center"
                      style={{ height: "112px" }}
                    >
                      <div
                        className="w-full rounded-t-lg bg-linear-to-t from-blue-600 to-blue-400 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-300 relative"
                        style={{
                          height: `${(d.users / maxUsers) * 100}%`,
                          minHeight: "8px",
                        }}
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap border border-white/10 z-10">
                          {d.users.toLocaleString("vi-VN")}
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-500 text-xs">{d.day}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-36 flex items-center justify-center text-slate-600 text-sm">
                Chưa có dữ liệu hoạt động tuần này
              </div>
            )}
          </div>

          {/* Today activity */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold">Hoạt động hôm nay</h3>
              <Activity size={16} className="text-slate-500" />
            </div>

            {todayCards.length > 0 ? (
              todayCards.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/6 transition-colors cursor-default"
                >
                  <div
                    className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center`}
                  >
                    <item.icon size={16} className={item.color} />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-400 text-xs">{item.label}</p>
                    <p className="text-white font-bold text-base">
                      {item.value}
                    </p>
                  </div>
                  <ArrowUpRight size={14} className="text-green-400" />
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
                Chưa có dữ liệu hôm nay
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          {/* Recent users */}
          <div className="xl:col-span-3 bg-white/3 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Học viên mới đăng ký</h3>
              <button className="text-blue-400 text-xs font-semibold hover:text-blue-300 transition-colors">
                Xem tất cả →
              </button>
            </div>

            {recentUsers.length > 0 ? (
              /* recentUsers: [{ name, email, course, status, joined, avatar, avatarColor }] */
              <div className="space-y-2">
                {recentUsers.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/4 transition-colors group"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl ${u.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                    >
                      {u.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">
                        {u.name}
                      </p>
                      <p className="text-slate-500 text-xs truncate">
                        {u.email}
                      </p>
                    </div>
                    <div className="hidden sm:block text-center">
                      <p className="text-slate-400 text-xs">{u.course}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          u.status === "active"
                            ? "bg-green-500/15 text-green-400 border border-green-500/20"
                            : "bg-slate-500/15 text-slate-400 border border-slate-500/20"
                        }`}
                      >
                        {u.status === "active" ? "Active" : "Inactive"}
                      </span>
                      <span className="text-slate-600 text-xs hidden md:block whitespace-nowrap">
                        {u.joined}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-600 text-sm text-center py-8">
                Chưa có học viên mới
              </div>
            )}
          </div>

          {/* Top courses */}
          <div className="xl:col-span-2 bg-white/3 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Khóa học nổi bật</h3>
              <MoreHorizontal size={16} className="text-slate-500" />
            </div>

            {topCourses.length > 0 ? (
              /* topCourses: [{ name, students, revenue, rating, progress }] */
              <div className="space-y-4">
                {topCourses.map((c, i) => (
                  <div key={i} className="group cursor-default">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-slate-300 text-xs font-medium truncate pr-2 group-hover:text-white transition-colors">
                        {c.name}
                      </p>
                      <span className="text-white text-xs font-bold shrink-0">
                        {c.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-blue-500 to-cyan-400"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-slate-600 text-xs">
                        {c.students.toLocaleString("vi-VN")} học viên
                      </span>
                      <span className="text-slate-500 text-xs">
                        {c.revenue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-600 text-sm text-center py-8">
                Chưa có dữ liệu khóa học
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
