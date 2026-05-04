// vocab-practice/frontend/src/app/user/achievements/page.tsx
"use client";
import React from "react";
import Topbar from "@/src/components/shared/Topbar";
import { Trophy, Flame, Star, Zap, Brain, Target, Lock } from "lucide-react";

const achievements = [
  {
    icon: Flame,
    label: "Người mới",
    desc: "Bắt đầu hành trình học tập",
    unlocked: true,
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Brain,
    label: "100 từ",
    desc: "Đã học 100 từ vựng",
    unlocked: true,
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    label: "Streak 7 ngày",
    desc: "Duy trì học 7 ngày liên tiếp",
    unlocked: true,
    color: "from-yellow-500 to-amber-500",
  },
  {
    icon: Star,
    label: "Hoàn hảo",
    desc: "Đạt 100% trong 1 bài kiểm tra",
    unlocked: false,
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Target,
    label: "500 từ",
    desc: "Đã học 500 từ vựng",
    unlocked: false,
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Trophy,
    label: "Vô địch",
    desc: "Top 10 bảng xếp hạng",
    unlocked: false,
    color: "from-amber-500 to-yellow-500",
  },
];

export default function UserAchievements() {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <>
      <Topbar
        title="Thành tích"
        subtitle={`${unlockedCount}/${achievements.length} đã mở khóa`}
        role="student"
        userName="Người dùng"
      />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((ach, i) => (
              <div
                key={i}
                className={`relative bg-white/3 border rounded-2xl p-5 flex flex-col items-center text-center transition-all ${
                  ach.unlocked
                    ? "border-white/10 hover:border-white/20"
                    : "border-white/5 opacity-50"
                }`}
              >
                {!ach.unlocked && (
                  <div className="absolute top-3 right-3">
                    <Lock size={14} className="text-slate-600" />
                  </div>
                )}
                <div
                  className={`w-14 h-14 rounded-2xl bg-linear-to-br ${ach.color} flex items-center justify-center mb-4 ${
                    ach.unlocked ? "shadow-lg" : "grayscale"
                  }`}
                >
                  <ach.icon size={28} className="text-white" />
                </div>
                <h3 className="text-white font-bold text-base mb-1">
                  {ach.label}
                </h3>
                <p className="text-slate-400 text-xs">{ach.desc}</p>
                {ach.unlocked && (
                  <span className="mt-3 text-xs px-3 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                    Đã mở khóa
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
