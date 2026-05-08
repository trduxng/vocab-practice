"use client";

import React, { useEffect, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Flame,
  Trophy,
  Brain,
  Target,
  BookOpen,
  ChevronRight,
  Zap,
  Clock,
  RotateCcw,
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

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen text-white bg-[#080d1a] font-mono">AUTHENTICATING...</div>;
  }

  const masteryTimeline = stats?.masteryTimeline;
  const progressPct = masteryTimeline
    ? Math.min(100, Math.round(Number(masteryTimeline.completionPercentage || 0)))
    : stats ? Math.min(100, Math.round((stats.totalLearned / 50) * 100)) : 0;

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
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/3 border border-white/5 rounded-2xl p-4 flex flex-col gap-2.5">
                   <Skeleton className="w-9 h-9 rounded-xl" />
                   <div className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-20" />
                   </div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex flex-col gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg"><Flame size={16} className="text-white" /></div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Streak</p>
                    <p className="text-white font-black text-2xl">{stats?.streak} ngày</p>
                  </div>
                </div>
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4 flex flex-col gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg"><Brain size={16} className="text-white" /></div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Đã học</p>
                    <p className="text-white font-black text-2xl">{stats?.totalLearned}</p>
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex flex-col gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"><Target size={16} className="text-white" /></div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Chính xác</p>
                    <p className="text-white font-black text-2xl">{stats?.accuracy}%</p>
                  </div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg"><Trophy size={16} className="text-white" /></div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Kinh nghiệm</p>
                    <p className="text-white font-black text-2xl">{(stats?.correct || 0) * 10} XP</p>
                  </div>
                </div>
              </>
            )}
        </div>

        {/* Main content row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            {/* Session Action */}
            <div className="bg-white/3 border border-white/8 rounded-[32px] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={120} /></div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-white font-black text-2xl uppercase tracking-tighter">Học tập ngay</h3>
                  <p className="text-slate-500 text-sm mt-1">Hệ thống đã chuẩn bị {loading ? '...' : flashcards.length} từ vựng cho bạn</p>
                </div>
                <button 
                  onClick={() => router.push('/user/learn')}
                  className="px-8 py-4 bg-white text-black hover:bg-blue-600 hover:text-white text-xs font-black rounded-2xl transition-all hover:-translate-y-1 shadow-2xl uppercase tracking-[0.2em] flex items-center gap-2"
                >
                  <Zap size={14} fill="currentColor" /> Bắt đầu
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Mục tiêu tuần</span>
                  <span className="text-white font-black text-xs">{loading ? '...' : stats?.totalLearned}/50 từ</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                  <div className="h-full rounded-full bg-linear-to-r from-blue-600 to-indigo-400 transition-all duration-1000 shadow-glow" style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              {/* Quick Word Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10">
                {loading ? (
                   [...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl bg-white/2" />)
                ) : flashcards.slice(0, 3).map((w, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-colors group cursor-default">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 border border-blue-500/20"><BookOpen size={14} className="text-blue-400" /></div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-black truncate">{w.term}</p>
                        <p className="text-slate-500 text-[9px] truncate">{w.meaning}</p>
                    </div>
                  </div>
                ))}
                {!loading && flashcards.length === 0 && <div className="col-span-3 py-6 text-center text-slate-600 text-sm italic border border-dashed border-white/5 rounded-2xl">Tuyệt vời! Bạn đã thuộc hết từ vựng hôm nay.</div>}
              </div>
            </div>

            {/* Real Weekly Activity Chart */}
            <div className="bg-white/3 border border-white/8 rounded-[32px] p-8">
              <h3 className="text-white font-black text-sm uppercase tracking-widest mb-2">Hoạt động 7 ngày qua</h3>
              <p className="text-slate-500 text-xs mb-8">Theo dõi số lượng câu hỏi bạn đã trả lời mỗi ngày.</p>
              
              <div className="h-[280px] w-full">
                {loading ? (
                   <Skeleton className="w-full h-full rounded-2xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.dailyTrends?.length > 0 ? stats.dailyTrends : [
                      { day: 'T2', count: 0 }, { day: 'T3', count: 0 }, { day: 'T4', count: 0 }, 
                      { day: 'T5', count: 0 }, { day: 'T6', count: 0 }, { day: 'T7', count: 0 }, { day: 'CN', count: 0 }
                    ]}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} 
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: '#fff'}}
                        itemStyle={{color: '#3b82f6'}}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#3b82f6" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Achievements */}
            <div className="bg-white/3 border border-white/8 rounded-[32px] p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-white font-black text-sm uppercase tracking-widest">Huy hiệu</h3>
                <Trophy size={16} className="text-amber-500" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {loading ? (
                   [...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)
                ) : stats?.achievements?.slice(0, 8).map((a: any) => (
                  <div key={a.id} className="group relative" title={a.label}>
                    <div className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all border-2 ${a.unlocked ? 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-900/10' : 'bg-white/2 border-white/5 grayscale opacity-20'}`}>
                      {a.icon}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Level Progression</span>
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">LV.{loading ? '...' : (Math.floor((stats?.correct || 0) / 10)) + 1}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                   <div className="h-full rounded-full bg-amber-500 shadow-glow" style={{ width: `${loading ? 0 : ((stats?.correct || 0) % 10) * 10}%` }} />
                </div>
              </div>
              <button 
                onClick={() => router.push('/user/achievements')}
                className="w-full mt-8 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
              >
                Xem tất cả thành tích →
              </button>
            </div>

            {/* Spaced Repetition Info */}
            <div className="bg-linear-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/20 rounded-[32px] p-8">
               <div className="flex items-center justify-between mb-6">
                <h3 className="text-violet-300 font-black text-sm uppercase tracking-widest">Ôn tập (SRS)</h3>
                <Clock size={16} className="text-violet-400" />
              </div>
              <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Cần ôn ngay</p>
                    <p className="text-white font-black text-3xl">{loading ? '...' : flashcards.length}</p>
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed italic">Hệ thống SRS sử dụng thuật toán tối ưu để nhắc nhở bạn ôn tập đúng thời điểm, giúp ghi nhớ từ vựng vĩnh viễn.</p>
              </div>
              <button 
                onClick={() => router.push('/user/practice')}
                className="w-full mt-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-violet-900/20"
              >
                Luyện tập trắc nghiệm
              </button>
            </div>
            {/* Mastery timeline */}
            <div className="bg-white/3 border border-white/8 rounded-[32px] p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-black text-sm uppercase tracking-widest">Mastery timeline</h3>
                <RotateCcw size={16} className="text-blue-400" />
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Completion</span>
                    <span className="text-white text-xs font-black">{loading ? '...' : `${progressPct}%`}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
                    <div className="h-full rounded-full bg-blue-500 transition-all duration-1000" style={{ width: `${loading ? 0 : progressPct}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Mastered</p>
                    <p className="mt-2 text-white text-2xl font-black">{loading ? '...' : `${masteryTimeline?.masteredWords || 0}/${masteryTimeline?.totalWords || 0}`}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">ETA days</p>
                    <p className="mt-2 text-white text-2xl font-black">{loading ? '...' : (masteryTimeline?.estimatedDaysToMastery ?? '-')}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  {masteryTimeline?.projectedCompletionDate
                    ? `Projected completion: ${new Date(masteryTimeline.projectedCompletionDate).toLocaleDateString()}`
                    : 'Keep practicing to generate a reliable completion projection.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default StudentDashboard;
