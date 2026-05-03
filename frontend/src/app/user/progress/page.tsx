"use client";

import React, { useEffect, useState } from "react";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import { Card, CardContent } from "@/src/components/ui/card";
import { TrendingUp, BookOpen, Target, Flame, Brain, AlertCircle } from "lucide-react";

const UserProgress = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
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

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white">Đang tổng hợp dữ liệu...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0a0f1e]">
      <Topbar title="Tiến độ học tập" role="student" userName={user?.fullName} />
      
      <main className="p-6 space-y-8 overflow-auto max-w-6xl mx-auto w-full">
        {/* OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <BookOpen className="mx-auto mb-2 text-blue-400" size={24} />
              <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Đã học</p>
              <p className="text-3xl font-black text-white">{stats.totalLearned}</p>
              <p className="text-[10px] text-slate-500 mt-1">từ vựng</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <Target className="mx-auto mb-2 text-green-400" size={24} />
              <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Chính xác</p>
              <p className="text-3xl font-black text-green-400">{stats.accuracy}%</p>
              <p className="text-[10px] text-slate-500 mt-1">tỉ lệ trả lời đúng</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <Flame className="mx-auto mb-2 text-orange-400" size={24} />
              <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Streak</p>
              <p className="text-3xl font-black text-orange-400">{stats.streak}</p>
              <p className="text-[10px] text-slate-500 mt-1">ngày liên tiếp</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <Brain className="mx-auto mb-2 text-violet-400" size={24} />
              <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Tổng câu</p>
              <p className="text-3xl font-black text-white">{stats.correct + stats.wrong}</p>
              <p className="text-[10px] text-slate-500 mt-1">lượt trả lời</p>
            </CardContent>
          </Card>
        </div>

        {/* PROGRESS BAR */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-white font-bold flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-400" />
                Hiệu suất trả lời
               </h3>
               <span className="text-xs text-slate-500 font-bold">{stats.correct} đúng / {stats.wrong} sai</span>
            </div>
            <div className="w-full h-4 bg-red-500/20 rounded-full overflow-hidden flex border border-white/5">
              <div
                className="h-full bg-linear-to-r from-green-600 to-green-400 transition-all duration-1000 shadow-lg shadow-green-500/20"
                style={{ width: `${stats.accuracy}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] uppercase font-bold tracking-wider">
               <span className="text-green-500">Chính xác</span>
               <span className="text-red-500">Cần cải thiện</span>
            </div>
          </CardContent>
        </Card>

        {/* WEAK WORDS */}
        <Card className="bg-white/5 border-white/10 overflow-hidden">
           <CardContent className="p-0">
             <div className="bg-white/5 p-4 border-b border-white/10 flex items-center gap-2">
                <AlertCircle size={18} className="text-red-400" />
                <h3 className="text-white font-bold text-sm">Từ vựng cần chú ý (Weak Words)</h3>
             </div>
             <div className="divide-y divide-white/5">
                {stats.weakWords.length > 0 ? stats.weakWords.map((w: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 hover:bg-white/2 transition-colors group">
                    <div>
                      <p className="text-white font-bold group-hover:text-blue-400 transition-colors">{w.word}</p>
                      <p className="text-slate-500 text-xs">{w.meaning}</p>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase font-bold">Lapsed</span>
                  </div>
                )) : (
                  <div className="p-10 text-center text-slate-600 italic">Chúc mừng! Bạn chưa có từ nào bị "hổng" kiến thức.</div>
                )}
             </div>
           </CardContent>
        </Card>

        {/* RECENT HISTORY */}
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
                       {stats.recentAttempts?.map((att: any, i: number) => (
                         <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4 text-[10px] text-slate-500 font-mono">
                               {new Date(att.date).toLocaleString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 text-white font-bold">{att.term}</td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${att.isCorrect ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                  {att.isCorrect ? 'Đúng' : 'Sai'}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400 text-xs italic">"{att.answer}"</td>
                         </tr>
                       ))}
                       {(!stats.recentAttempts || stats.recentAttempts.length === 0) && (
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
