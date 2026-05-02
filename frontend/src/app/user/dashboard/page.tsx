"use client";

import React, { useEffect, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import {
  Flame,
  Trophy,
  Brain,
  Target,
  BookOpen,
  ChevronRight,
  Zap,
  TrendingUp,
  Clock,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

const StudentDashboard = () => {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flashcardsData, statsData] = await Promise.all([
          userService.getDueFlashcards(),
          userService.getStats()
        ]);
        setFlashcards(flashcardsData);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen text-white bg-slate-950 font-mono">LOADING SYSTEM...</div>;
  }

  const progressPct = Math.min(100, Math.round((stats?.totalLearned / 50) * 100)); // Demo goal is 50 words

  return (
    <>
      <Topbar
        title="Tổng quan học tập"
        subtitle="Chào buổi sáng! Tiếp tục chuỗi streak của bạn nào 🔥"
        role="student"
        userName={user?.fullName || "Người dùng"}
      />

      <main className="flex-1 p-6 space-y-5 overflow-auto bg-[#080d1a]">
        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg"><Flame size={16} className="text-white" /></div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold">Streak</p>
                <p className="text-white font-black text-2xl">{stats?.streak} ngày</p>
              </div>
            </div>
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg"><Brain size={16} className="text-white" /></div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold">Đã học</p>
                <p className="text-white font-black text-2xl">{stats?.totalLearned}</p>
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"><Target size={16} className="text-white" /></div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold">Chính xác</p>
                <p className="text-white font-black text-2xl">{stats?.accuracy}%</p>
              </div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg"><Trophy size={16} className="text-white" /></div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold">Kinh nghiệm</p>
                <p className="text-white font-black text-2xl">{stats?.correct * 10} XP</p>
              </div>
            </div>
        </div>

        {/* Main content row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            {/* Session Action */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={120} /></div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-white font-black text-xl uppercase tracking-tighter">Học tập ngay</h3>
                  <p className="text-slate-500 text-xs mt-1">Hệ thống đã chuẩn bị {flashcards.length} từ vựng cho bạn</p>
                </div>
                <button 
                  onClick={() => router.push('/user/learn')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl transition-all hover:-translate-y-1 shadow-xl shadow-blue-500/25 uppercase tracking-widest flex items-center gap-2"
                >
                  <Zap size={14} fill="white" /> Bắt đầu
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Mục tiêu tuần</span>
                  <span className="text-white font-bold text-xs">{stats?.totalLearned}/50 từ</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                  <div className="h-full rounded-full bg-linear-to-r from-blue-600 to-cyan-400 transition-all duration-1000 shadow-glow" style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              {/* Quick Word Preview */}
              <div className="space-y-2 mt-8">
                {flashcards.slice(0, 3).map((w, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 transition-colors group cursor-default">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 border border-blue-500/20"><BookOpen size={14} className="text-blue-400" /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-bold">{w.term}</span>
                        <span className="text-slate-500 text-xs">·</span>
                        <span className="text-slate-400 text-xs truncate">{w.meaning}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-700 group-hover:text-blue-400" />
                  </div>
                ))}
                {flashcards.length === 0 && <div className="p-10 text-center text-slate-600 text-sm italic">Hôm nay bạn đã thuộc hết từ vựng rồi!</div>}
              </div>
            </div>

            {/* Simple Weekly Activity */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-6">Tỉ lệ hoàn thành</h3>
              <div className="h-32 flex items-center justify-center text-slate-600 border border-dashed border-white/10 rounded-xl">
                 <p className="text-xs uppercase tracking-widest font-bold">Sẽ cập nhật biểu đồ tại Phase 4.3</p>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Achievements */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-black text-sm uppercase tracking-widest">Thành tích</h3>
                <Trophy size={16} className="text-amber-500" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {stats?.achievements?.map((a: any) => (
                  <div key={a.id} className="group relative" title={a.label}>
                    <div className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all border ${a.unlocked ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/2 border-white/5 grayscale opacity-20'}`}>
                      {a.icon}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Cấp độ tiếp theo</span>
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">LV.{(Math.floor(stats?.correct / 10)) + 1}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-500 shadow-glow" style={{ width: `${(stats?.correct % 10) * 10}%` }} />
                </div>
              </div>
            </div>

            {/* Spaced Repetition Info */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
               <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-sm">Ôn tập (SRS)</h3>
                <Clock size={16} className="text-slate-500" />
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <span className="text-xs text-violet-300 font-bold uppercase">Cần ôn ngay</span>
                    <span className="text-white font-black">{flashcards.length}</span>
                 </div>
                 <p className="text-[10px] text-slate-500 leading-relaxed italic">Hệ thống tính toán thời điểm vàng để bạn không bao giờ quên từ vựng.</p>
              </div>
              <button 
                onClick={() => router.push('/user/practice')}
                className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={13} /> Luyện tập trắc nghiệm
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default StudentDashboard;
