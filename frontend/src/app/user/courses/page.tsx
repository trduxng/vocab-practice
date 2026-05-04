"use client";

import React, { useEffect, useState } from "react";
import { categoriesService } from "@/src/services/categories.service";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { BookOpen, GraduationCap, ChevronRight, Zap, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const UserCoursesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await categoriesService.getTopics();
        setTopics(data);
      } catch (error) {
        console.error("Failed to fetch topics", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTopics();
  }, [user]);

  const handleEnroll = (topicId: number, topicName: string) => {
    toast.success(`Đã ghi danh vào khóa ${topicName}! Bắt đầu học ngay.`);
    router.push('/user/learn');
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-[#080d1a] text-white">Đang tải danh sách lộ trình...</div>;

  return (
    <div className="flex-1 flex flex-col bg-[#080d1a]">
      <Topbar title="Lộ trình học tập" role="student" userName={user?.fullName} />
      
      <main className="p-6 space-y-8 overflow-auto max-w-6xl mx-auto w-full py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
              <h1 className="text-white text-3xl font-black uppercase tracking-tighter mb-2">Chọn mục tiêu của bạn</h1>
              <p className="text-slate-500 text-sm">Khám phá các bộ từ vựng được biên soạn chuyên sâu.</p>
           </div>
           <div className="flex gap-2">
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                 <Star size={14} className="text-amber-500" /> 120,000+ Học viên
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {topics.map((t) => (
             <Card key={t.id} className="bg-white/3 border border-white/8 hover:border-blue-500/30 transition-all rounded-[32px] overflow-hidden group">
                <CardContent className="p-0">
                   <div className="h-32 bg-linear-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-grid opacity-10" />
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white backdrop-blur-xl group-hover:scale-110 transition-transform">
                         <GraduationCap size={32} />
                      </div>
                      <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter border border-green-500/20">
                         Mới cập nhật
                      </div>
                   </div>
                   <div className="p-8">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">
                         <BookOpen size={12} /> {t.code || "COURSE"}
                      </div>
                      <h3 className="text-white font-bold text-xl mb-3 group-hover:text-blue-400 transition-colors">{t.name}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-8 h-10 line-clamp-2">{t.description || "Nâng cao vốn từ vựng chuyên sâu và ứng dụng vào thực tế."}</p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                         <div className="flex flex-col">
                            <span className="text-[10px] text-slate-600 font-black uppercase tracking-tighter">Độ khó</span>
                            <div className="flex gap-0.5 mt-1">
                               {[...Array(5)].map((_, i) => (
                                 <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < 3 ? 'bg-amber-500' : 'bg-white/10'}`} />
                               ))}
                            </div>
                         </div>
                         <Button 
                          onClick={() => handleEnroll(t.id, t.name)}
                          className="bg-white text-slate-900 hover:bg-blue-600 hover:text-white font-black text-xs uppercase tracking-widest px-6 py-5 rounded-2xl transition-all flex items-center gap-2"
                         >
                            Học ngay <ChevronRight size={14} />
                         </Button>
                      </div>
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>

        <div className="bg-white/3 border border-white/8 rounded-[40px] p-12 relative overflow-hidden flex flex-col items-center text-center">
           <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={200} /></div>
           <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-4">Bạn muốn học chủ đề khác?</h3>
           <p className="text-slate-500 text-sm max-w-md mb-8">Chúng tôi luôn cập nhật các bộ từ vựng mới hàng tuần. Hãy gửi yêu cầu nếu bạn cần một lộ trình riêng biệt.</p>
           <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 h-12 px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest">Yêu cầu chủ đề mới</Button>
        </div>
      </main>
    </div>
  );
};

export default UserCoursesPage;
