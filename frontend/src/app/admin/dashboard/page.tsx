'use client';
import React, { useState, useEffect } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { useAuth } from "@/src/app/context/AuthContext";
import { adminService } from "@/src/services/admin.service";
import {
  Users,
  BookOpen,
  TrendingUp,
  ArrowUpRight,
  UserPlus,
  Star,
  Activity,
  Zap,
} from "lucide-react";

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load admin stats", error);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadStats();
  }, [user]);

  if (authLoading || loading) {
    return <div className="flex-1 flex items-center justify-center text-slate-500 text-sm bg-[#080d1a] min-h-screen font-mono">LOADING ADMIN CORE...</div>;
  }

  return (
    <>
      <Topbar
        title="Bàn làm việc Quản trị"
        subtitle={`Hệ thống đang vận hành ổn định. Chào mừng ${user?.fullName}!`}
        role="admin"
        userName={user?.fullName}
      />

      <main className="flex-1 p-6 space-y-6 overflow-auto bg-[#080d1a]">
        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: "Tổng học viên", value: stats?.totalStudents, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
             { label: "Từ vựng", value: stats?.totalWords, icon: BookOpen, color: "text-violet-400", bg: "bg-violet-500/10" },
             { label: "Chủ đề học", value: stats?.totalTopics, icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
             { label: "Lượt học tập", value: stats?.totalAttempts, icon: Activity, color: "text-green-400", bg: "bg-green-500/10" },
           ].map((s, i) => (
             <div key={i} className="bg-white/3 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
                   <s.icon size={24} />
                </div>
                <div>
                   <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{s.label}</p>
                   <p className="text-white text-2xl font-black">{s.value}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white/3 border border-white/8 rounded-3xl p-10 relative overflow-hidden">
              <div className="relative z-10">
                 <h2 className="text-white text-2xl font-black uppercase tracking-tighter mb-4">Trình quản lý nội dung</h2>
                 <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">Bạn có thể thêm từ vựng mới, tạo câu hỏi trắc nghiệm hoặc thiết kế các bài Mini Test để học viên luyện tập.</p>
                 <div className="flex gap-4">
                    <a href="/admin/words" className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all uppercase tracking-widest">Quản lý từ</a>
                    <a href="/admin/questions" className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all uppercase tracking-widest border border-white/10">Tạo câu hỏi</a>
                 </div>
              </div>
              <Activity size={200} className="absolute -right-20 -bottom-20 text-blue-500 opacity-5" />
           </div>

           <div className="bg-white/3 border border-white/8 rounded-3xl p-10 flex flex-col justify-center text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                 <TrendingUp size={32} className="text-green-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Tăng trưởng học viên</h3>
              <p className="text-slate-500 text-sm">Hệ thống ghi nhận <span className="text-green-400 font-bold">+12%</span> sự tích cực học tập so với tuần trước.</p>
           </div>
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
