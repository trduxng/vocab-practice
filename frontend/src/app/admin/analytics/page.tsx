// vocab-practice/frontend/src/app/admin/analytics/page.tsx
"use client";
import React from "react";
import Topbar from "@/src/components/shared/Topbar";
import { BarChart3, TrendingUp, Users, BookOpen } from "lucide-react";

export default function AdminAnalytics() {
  return (
    <>
      <Topbar title="Thống kê chi tiết" role="admin" userName="Admin" />

      <main className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              icon: Users,
              label: "Tổng học viên",
              value: "12,450",
              change: "+12%",
              color: "from-blue-500 to-blue-600",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
            },
            {
              icon: BookOpen,
              label: "Khóa học active",
              value: "48",
              change: "+3",
              color: "from-violet-500 to-purple-600",
              bg: "bg-violet-500/10",
              border: "border-violet-500/20",
            },
            {
              icon: BarChart3,
              label: "Lượt học hôm nay",
              value: "2,845",
              change: "+18%",
              color: "from-green-500 to-emerald-600",
              bg: "bg-green-500/10",
              border: "border-green-500/20",
            },
            {
              icon: TrendingUp,
              label: "Tỉ lệ hoàn thành",
              value: "87%",
              change: "+5%",
              color: "from-amber-500 to-orange-500",
              bg: "bg-amber-500/10",
              border: "border-amber-500/20",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`${stat.bg} border ${stat.border} rounded-2xl p-5`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm">{stat.label}</span>
                <div
                  className={`w-9 h-9 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon size={16} className="text-white" />
                </div>
              </div>
              <p className="text-white text-2xl font-bold">{stat.value}</p>
              <p className="text-green-400 text-xs mt-1">
                {stat.change} so với tháng trước
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
          <BarChart3 size={64} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-white text-lg font-bold mb-2">
            Biểu đồ thống kê
          </h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Tính năng đang được phát triển. Sẽ sớm có biểu đồ chi tiết về hoạt
            động học tập, doanh thu và tỉ lệ hoàn thành.
          </p>
        </div>
      </main>
    </>
  );
}
