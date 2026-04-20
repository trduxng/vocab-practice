import React from "react";
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

const stats = [
  {
    label: "Tổng học viên",
    value: "524,831",
    change: "+12.5%",
    up: true,
    icon: Users,
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    label: "Doanh thu tháng",
    value: "₫842.5M",
    change: "+8.2%",
    up: true,
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  {
    label: "Khóa học active",
    value: "1,284",
    change: "+3.1%",
    up: true,
    icon: BookOpen,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    label: "Tỉ lệ hoàn thành",
    value: "73.4%",
    change: "-2.3%",
    up: false,
    icon: TrendingUp,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
];

const recentUsers = [
  {
    name: "Nguyễn Minh Anh",
    email: "minh.anh@gmail.com",
    course: "IELTS Master",
    status: "active",
    joined: "2 giờ trước",
    avatar: "MA",
    color: "bg-blue-500",
  },
  {
    name: "Trần Bảo Châu",
    email: "bao.chau@gmail.com",
    course: "TOEIC 800+",
    status: "active",
    joined: "5 giờ trước",
    avatar: "BC",
    color: "bg-pink-500",
  },
  {
    name: "Phạm Quốc Hùng",
    email: "quoc.hung@gmail.com",
    course: "Giao tiếp",
    status: "inactive",
    joined: "1 ngày trước",
    avatar: "QH",
    color: "bg-green-500",
  },
  {
    name: "Lê Thu Hà",
    email: "thu.ha@gmail.com",
    course: "IELTS Master",
    status: "active",
    joined: "1 ngày trước",
    avatar: "TH",
    color: "bg-amber-500",
  },
  {
    name: "Võ Thanh Long",
    email: "thanh.long@gmail.com",
    course: "TOEIC 800+",
    status: "active",
    joined: "2 ngày trước",
    avatar: "TL",
    color: "bg-cyan-500",
  },
];

const topCourses = [
  {
    name: "IELTS Vocabulary Master",
    students: 120000,
    revenue: "₫312M",
    rating: 4.9,
    progress: 88,
  },
  {
    name: "TOEIC 800+ Vocabulary",
    students: 85000,
    revenue: "₫198M",
    rating: 4.8,
    progress: 72,
  },
  {
    name: "Giao Tiếp Hàng Ngày",
    students: 200000,
    revenue: "₫280M",
    rating: 4.9,
    progress: 95,
  },
  {
    name: "Business English",
    students: 42000,
    revenue: "₫98M",
    rating: 4.7,
    progress: 45,
  },
];

const activityData = [
  { day: "T2", users: 4200, revenue: 85 },
  { day: "T3", users: 3800, revenue: 72 },
  { day: "T4", users: 5100, revenue: 91 },
  { day: "T5", users: 4700, revenue: 88 },
  { day: "T6", users: 6200, revenue: 100 },
  { day: "T7", users: 5800, revenue: 94 },
  { day: "CN", users: 4400, revenue: 78 },
];

const AdminDashboard = () => {
  const maxUsers = Math.max(...activityData.map((d) => d.users));

  return (
    <>
      <Topbar
        title="Tổng quan hệ thống"
        subtitle="Chào mừng trở lại, hôm nay là Thứ Tư, 16/04/2026"
        role="admin"
        userName="Admin"
      />

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s, i) => (
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

        {/* Chart + Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Bar chart - Weekly users */}
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i === 0 ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/6"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="flex items-end gap-3 h-36">
              {activityData.map((d, i) => (
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
          </div>

          {/* Quick stats */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold">Hoạt động hôm nay</h3>
              <Activity size={16} className="text-slate-500" />
            </div>

            {[
              {
                icon: UserPlus,
                label: "Đăng ký mới",
                value: "1,284",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                icon: Eye,
                label: "Lượt học",
                value: "48,392",
                color: "text-violet-400",
                bg: "bg-violet-500/10",
              },
              {
                icon: Star,
                label: "Đánh giá mới",
                value: "234",
                color: "text-amber-400",
                bg: "bg-amber-500/10",
              },
              {
                icon: DollarSign,
                label: "Doanh thu",
                value: "₫28.4M",
                color: "text-green-400",
                bg: "bg-green-500/10",
              },
            ].map((item, i) => (
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
                  <p className="text-white font-bold text-base">{item.value}</p>
                </div>
                <ArrowUpRight size={14} className="text-green-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          {/* Recent users table */}
          <div className="xl:col-span-3 bg-white/3 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Học viên mới đăng ký</h3>
              <button className="text-blue-400 text-xs font-semibold hover:text-blue-300 transition-colors">
                Xem tất cả →
              </button>
            </div>
            <div className="space-y-2">
              {recentUsers.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/4 transition-colors group"
                >
                  <div
                    className={`w-9 h-9 rounded-xl ${u.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                  >
                    {u.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {u.name}
                    </p>
                    <p className="text-slate-500 text-xs truncate">{u.email}</p>
                  </div>
                  <div className="hidden sm:block text-center">
                    <p className="text-slate-400 text-xs">{u.course}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.status === "active" ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-slate-500/15 text-slate-400 border border-slate-500/20"}`}
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
          </div>

          {/* Top courses */}
          <div className="xl:col-span-2 bg-white/3 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Khóa học nổi bật</h3>
              <MoreHorizontal size={16} className="text-slate-500" />
            </div>
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
                    <span className="text-slate-500 text-xs">{c.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
