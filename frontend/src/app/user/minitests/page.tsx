"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, Clock, FileText } from "lucide-react";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

type MiniTest = {
  id: number;
  title: string;
  description?: string;
  topicName?: string;
  totalQuestions?: number;
};

const MiniTestsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [tests, setTests] = useState<MiniTest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const data = await userService.getMiniTests();
        setTests(data);
      } catch (error) {
        console.error("Failed to fetch mini tests", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTests();
    }
  }, [user]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#080d1a] text-white">Đang tải danh sách bài kiểm tra...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-[#080d1a]">
      <Topbar title="Bài kiểm tra ngắn" role="student" userName={user?.fullName} />

      <main className="p-6 space-y-6 overflow-auto max-w-5xl mx-auto w-full">
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-white text-2xl font-black uppercase tracking-tighter mb-2 text-balance">Thử thách trình độ của bạn</h2>
            <p className="text-blue-300/60 text-sm max-w-md">Các bài kiểm tra ngắn giúp bạn tổng hợp kiến thức và đo lường sự tiến bộ thực tế sau mỗi chủ đề.</p>
          </div>
          <FileText size={180} className="absolute -right-10 -bottom-10 text-blue-500 opacity-10 rotate-12" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.length > 0 ? tests.map((test) => (
            <Card key={test.id} className="bg-white/5 border-white/10 hover:border-blue-500/30 transition-all group overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <FileText size={24} />
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded bg-white/5 text-slate-500 font-bold uppercase tracking-widest border border-white/5">
                      {test.topicName || "Tổng hợp"}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">{test.title}</h3>
                  <p className="text-slate-500 text-xs line-clamp-2 mb-6 h-8">{test.description || "Bài kiểm tra đánh giá năng lực từ vựng tổng hợp."}</p>

                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">
                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-blue-500" /> 10 phút</span>
                    <span className="flex items-center gap-1.5"><BookOpen size={12} className="text-blue-500" /> {test.totalQuestions || 0} câu</span>
                  </div>

                  <Button
                    onClick={() => router.push(`/user/minitests/${test.id}`)}
                    className="w-full bg-white text-slate-900 hover:bg-blue-600 hover:text-white font-black text-xs uppercase tracking-widest py-6 rounded-2xl transition-all"
                  >
                    Bắt đầu làm bài <ChevronRight size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-2 py-20 text-center text-slate-600 border border-dashed border-white/10 rounded-3xl">
              <FileText size={48} className="mx-auto mb-4 opacity-10" />
              <p>Hiện chưa có bài kiểm tra nào được xuất bản.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MiniTestsPage;
