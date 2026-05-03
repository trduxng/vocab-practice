"use client";

import React, { useEffect, useState } from "react";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import { Card, CardContent } from "@/src/components/ui/card";
import { Trophy, Star, Target, Zap, ShieldCheck, Lock } from "lucide-react";

const UserAchievements = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
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

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white">Đang tải bảng vàng...</div>;

  return (
    <div className="flex-1 flex flex-col bg-[#0a0f1e]">
      <Topbar title="Thành tích & Huy hiệu" role="student" userName={user?.fullName} />
      
      <main className="p-6 space-y-8 overflow-auto max-w-5xl mx-auto w-full py-12">
        <div className="text-center mb-12">
           <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30 shadow-2xl">
              <Trophy size={40} className="text-amber-500" />
           </div>
           <h1 className="text-white text-3xl font-black uppercase tracking-tighter">Bảng vàng thành tích</h1>
           <p className="text-slate-500 text-sm mt-2">Nâng cao trình độ và mở khóa những huy hiệu danh giá</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {stats?.achievements?.map((a: any) => (
             <Card key={a.id} className={`bg-white/3 border transition-all rounded-[32px] overflow-hidden ${a.unlocked ? 'border-amber-500/20 shadow-lg shadow-amber-900/5' : 'border-white/5 opacity-50'}`}>
                <CardContent className="p-8 flex items-center gap-6">
                   <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center text-4xl shadow-2xl transition-transform group-hover:scale-110 ${a.unlocked ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5 border border-white/5'}`}>
                      {a.unlocked ? a.icon : <Lock size={24} className="text-slate-700" />}
                   </div>
                   <div className="flex-1">
                      <h3 className={`font-black uppercase tracking-widest text-sm mb-1 ${a.unlocked ? 'text-white' : 'text-slate-600'}`}>{a.label}</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {a.id === 1 && "Bắt đầu hành trình học tập với từ vựng đầu tiên."}
                        {a.id === 2 && "Vượt qua thử thách trả lời đúng 100 câu hỏi."}
                        {a.id === 3 && "Duy trì tỉ lệ chính xác trên 90% cực kỳ ấn tượng."}
                        {a.id === 4 && "Trở thành chuyên gia với 50 từ vựng đã thành thạo."}
                        {a.id === 5 && "Không bỏ cuộc! Duy trì chuỗi học tập 7 ngày liên tục."}
                      </p>
                      {a.unlocked ? (
                        <div className="mt-3 flex items-center gap-1.5 text-green-500 text-[10px] font-black uppercase tracking-widest">
                           <ShieldCheck size={12} /> Đã đạt được
                        </div>
                      ) : (
                        <div className="mt-3 text-slate-700 text-[10px] font-black uppercase tracking-widest">
                           Còn thiếu dữ liệu
                        </div>
                      )}
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>

        <div className="bg-white/3 border border-white/8 rounded-[40px] p-10 mt-12 flex flex-col items-center text-center">
           <Star size={32} className="text-blue-400 mb-4" />
           <h3 className="text-white font-bold mb-2">Thách thức bản thân</h3>
           <p className="text-slate-500 text-sm max-w-sm">Tiếp tục học tập mỗi ngày để nhận thêm nhiều XP và thăng cấp huy hiệu của bạn.</p>
        </div>
      </main>
    </div>
  );
};

export default UserAchievements;
