"use client";

import React, { useEffect, useState } from "react";
import { Lock, ShieldCheck, Star, Trophy } from "lucide-react";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import { Card, CardContent } from "@/src/components/ui/card";

type Achievement = {
  id: number;
  icon: string;
  label: string;
  unlocked: boolean;
};

type AchievementStats = {
  achievements?: Achievement[];
};

const achievementDescription = (id: number) => {
  const descriptions: Record<number, string> = {
    1: "Bắt đầu hành trình học tập với từ vựng đầu tiên.",
    2: "Trả lời đúng 100 câu hỏi luyện tập.",
    3: "Duy trì độ chính xác trên 90% khi đã học ít nhất 10 từ.",
    4: "Thành thạo 50 từ vựng.",
    5: "Duy trì chuỗi học tập 7 ngày liên tục.",
  };

  return descriptions[id] || "Tiếp tục học tập để mở khóa huy hiệu này.";
};

const UserAchievements = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await userService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch achievements", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white">Đang tải bảng thành tích...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950">
      <Topbar title="Thành tích và huy hiệu" role="student" userName={user?.fullName} />

      <main className="p-6 space-y-8 overflow-auto max-w-5xl mx-auto w-full py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30 shadow-2xl">
            <Trophy size={40} className="text-amber-500" />
          </div>
          <h1 className="text-slate-900 dark:text-white text-3xl font-black uppercase tracking-tighter">Bảng thành tích</h1>
          <p className="text-slate-500 dark:text-slate-400 text-slate-500 text-sm mt-2">Theo dõi các cột mốc học tập và mở khóa huy hiệu mới.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats?.achievements?.map((achievement) => (
            <Card key={achievement.id} className={`dark:bg-white/3 bg-white border transition-all rounded-[32px] overflow-hidden ${achievement.unlocked ? "border-amber-500/20 shadow-lg shadow-amber-900/5" : "border-slate-200 dark:border-white/5 opacity-50"}`}>
              <CardContent className="p-8 flex items-center gap-6">
                <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center text-4xl shadow-2xl transition-transform ${achievement.unlocked ? "bg-amber-500/10 border border-amber-500/20" : "bg-white/5 border border-white/5"}`}>
                  {achievement.unlocked ? achievement.icon : <Lock size={24} className="text-slate-700" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-black uppercase tracking-widest text-sm mb-1 ${achievement.unlocked ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-600 text-slate-400"}`}>{achievement.label}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-slate-500 text-xs leading-relaxed">{achievementDescription(achievement.id)}</p>
                  {achievement.unlocked ? (
                    <div className="mt-3 flex items-center gap-1.5 text-green-500 text-[10px] font-black uppercase tracking-widest">
                      <ShieldCheck size={12} /> Đã đạt được
                    </div>
                  ) : (
                    <div className="mt-3 text-slate-700 text-[10px] font-black uppercase tracking-widest">Chưa mở khóa</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>            <div className="dark:bg-white/3 bg-white border border-slate-200 dark:border-white/8 rounded-[40px] p-10 mt-12 flex flex-col items-center text-center shadow-sm">
              <Star size={32} className="text-blue-400 mb-4" />
              <h3 className="text-slate-900 dark:text-white font-bold mb-2">Thử thách bản thân</h3>
              <p className="text-slate-500 dark:text-slate-400 text-slate-500 text-sm max-w-sm">Tiếp tục học mỗi ngày để nhận thêm XP và nâng cấp huy hiệu của bạn.</p>
        </div>
      </main>
    </div>
  );
};

export default UserAchievements;
