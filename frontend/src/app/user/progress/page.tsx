"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, BookOpen, Flame, TrendingUp } from "lucide-react";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

type ProgressStats = {
  accuracy?: number;
  totalLearned?: number;
  correct?: number;
  wrong?: number;
  weakWords?: Array<{ word: string; meaning: string }>;
  recentAttempts?: Array<{ date: string; term: string; isCorrect: boolean; answer: string }>;
};

const UserProgress = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await userService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#080d1a] text-white">Đang tải báo cáo...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-[#080d1a]">
      <Topbar title="Tiến độ học tập" role="student" userName={user?.fullName} />

      <main className="p-6 space-y-6 overflow-auto bg-[#080d1a]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-white/10 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Độ chính xác</p>
              <p className="text-white text-2xl font-black">{stats?.accuracy || 0}%</p>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Từ đã học</p>
              <p className="text-white text-2xl font-black">{stats?.totalLearned || 0}</p>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Flame size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Kết quả luyện tập</p>
              <p className="text-white text-2xl font-black">{stats?.correct || 0} đúng / {stats?.wrong || 0} sai</p>
            </div>
          </Card>
        </div>

        <Card className="bg-white/5 border-white/10 overflow-hidden shadow-2xl">
          <CardHeader className="bg-white/5 border-b border-white/5">
            <CardTitle className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400" /> Từ vựng cần chú ý
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {stats?.weakWords?.length ? stats.weakWords.map((word, index) => (
                <div key={`${word.word}-${index}`} className="flex justify-between items-center p-4 hover:bg-white/2 transition-colors group">
                  <div>
                    <p className="text-white font-bold group-hover:text-blue-400 transition-colors">{word.word}</p>
                    <p className="text-slate-500 text-xs">{word.meaning}</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase font-bold">Cần ôn</span>
                </div>
              )) : (
                <div className="p-10 text-center text-slate-600 italic">Chúc mừng! Bạn chưa có từ nào cần chú ý.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 overflow-hidden shadow-2xl">
          <CardHeader className="bg-white/5 border-b border-white/5">
            <CardTitle className="text-white text-sm font-bold uppercase tracking-widest">Lịch sử luyện tập gần đây</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] text-slate-600 uppercase font-black tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Từ vựng</th>
                    <th className="px-6 py-4">Kết quả</th>
                    <th className="px-6 py-4">Câu trả lời</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats?.recentAttempts?.length ? stats.recentAttempts.map((attempt, index) => (
                    <tr key={`${attempt.term}-${index}`} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-[10px] text-slate-500 font-mono">{new Date(attempt.date).toLocaleString("vi-VN")}</td>
                      <td className="px-6 py-4 text-white font-bold">{attempt.term}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${attempt.isCorrect ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                          {attempt.isCorrect ? "Đúng" : "Sai"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs italic">&quot;{attempt.answer}&quot;</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-slate-600 italic">Bạn chưa thực hiện lượt trả lời nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserProgress;
