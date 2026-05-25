"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Brain, Calendar, ChevronRight, FileText } from "lucide-react";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";

type TestHistory = {
  date: string;
  testId: number;
  testTitle: string;
  totalQuestions: number;
  correctAnswers: number;
};

type SessionDetail = {
  questionText: string;
  questionType: string;
  correctAnswer: string;
  submittedAnswer?: string;
  isCorrect: boolean;
  term: string;
  meaning: string;
};

const MiniTestHistoryPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<TestHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<TestHistory | null>(null);
  const [sessionDetails, setSessionDetails] = useState<SessionDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await userService.getTestHistory();
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch test history", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchHistory();
  }, [user]);

  const handleViewDetails = async (session: TestHistory) => {
    setSelectedSession(session);
    setDetailsLoading(true);

    try {
      const dateStr = new Date(session.date).toISOString().split("T")[0];
      const details = await userService.getTestSessionDetails(session.testId, dateStr);
      setSessionDetails(details);
    } catch (error) {
      console.error("Failed to fetch session details", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-mono">Đang tải lịch sử bài kiểm tra...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950">
      <Topbar title="Lịch sử bài kiểm tra" role="student" userName={user?.fullName} />

      <main className="p-6 space-y-6 overflow-auto max-w-4xl mx-auto w-full py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-slate-900 dark:text-white text-2xl font-black uppercase tracking-tighter">Kết quả học tập</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Theo dõi sự tiến bộ qua các bài kiểm tra ngắn.</p>
          </div>
        </div>

        <div className="space-y-4">
          {history.length > 0 ? history.map((session) => {
            const accuracy = session.totalQuestions ? Math.round((session.correctAnswers / session.totalQuestions) * 100) : 0;

            return (
              <Card key={`${session.testId}-${session.date}`} className="dark:bg-white/3 bg-white border border-slate-200 dark:border-white/8 rounded-[32px] overflow-hidden hover:border-blue-500/30 transition-all group shadow-sm">
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl dark:bg-white/5 bg-slate-100 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-colors">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-bold text-lg">{session.testTitle}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-mono">{new Date(session.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-widest mb-1">Kết quả</p>
                      <p className="text-slate-900 dark:text-white font-black">{session.correctAnswers} / {session.totalQuestions}</p>
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-widest mb-1">Độ chính xác</p>
                      <p className={`font-black ${accuracy >= 80 ? "text-green-400" : accuracy >= 50 ? "text-blue-400" : "text-red-400"}`}>{accuracy}%</p>
                    </div>
                    <Button onClick={() => handleViewDetails(session)} className="dark:bg-white/5 bg-slate-100 hover:dark:bg-white/10 hover:bg-slate-200 text-slate-900 dark:text-white rounded-xl px-6 h-11 font-bold text-xs uppercase tracking-widest gap-2">
                      Xem lại <ChevronRight size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          }) : (
            <div className="py-20 text-center text-slate-500 dark:text-slate-700 border border-dashed border-slate-200 dark:border-white/5 rounded-[40px]">
              <AlertCircle size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-bold uppercase tracking-widest text-xs">Bạn chưa thực hiện bài kiểm tra nào</p>
              <button onClick={() => router.push("/user/minitests")} className="mt-6 text-blue-500 font-bold hover:underline">
                Bắt đầu bài kiểm tra đầu tiên
              </button>
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-3xl bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white p-0 rounded-[40px] overflow-hidden">
          <DialogHeader className="p-8 bg-blue-600/10 dark:bg-blue-600/10 bg-blue-50 border-b border-slate-200 dark:border-white/5">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">{selectedSession?.testTitle}</DialogTitle>
                <p className="text-blue-600 dark:text-blue-400 text-xs font-bold mt-1 uppercase tracking-widest">
                  Chi tiết phiên thi ngày {selectedSession && new Date(selectedSession.date).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-900 dark:text-white font-black text-2xl">{selectedSession?.correctAnswers}/{selectedSession?.totalQuestions}</p>
                <p className="text-slate-500 dark:text-slate-400 text-slate-500 text-[10px] uppercase font-bold">Điểm số</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 max-h-[60vh] overflow-y-auto no-scrollbar space-y-4">
            {detailsLoading ? (
              <div className="py-20 text-center font-mono animate-pulse text-blue-500">Đang phân tích kết quả...</div>
            ) : sessionDetails.map((item, index) => (
              <div key={`${item.questionText}-${index}`} className={`p-6 rounded-3xl border-2 transition-all ${item.isCorrect ? "bg-green-500/5 dark:bg-green-500/5 bg-green-50 border-green-500/10" : "bg-red-500/5 dark:bg-red-500/5 bg-red-50 border-red-500/10"}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${item.isCorrect ? "bg-green-500 text-black" : "bg-red-500 text-white"}`}>
                    {item.isCorrect ? "Đúng" : "Sai"}
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold uppercase">{item.questionType}</span>
                </div>
                <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-2">{item.questionText}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 text-slate-500 uppercase font-black tracking-widest">Bạn đã trả lời</p>
                    <p className={`font-bold ${item.isCorrect ? "text-green-400" : "text-red-400"}`}>{item.submittedAnswer || "(Bỏ trống)"}</p>
                  </div>
                  {!item.isCorrect && (
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 text-slate-500 uppercase font-black tracking-widest">Đáp án đúng</p>
                      <p className="text-slate-900 dark:text-white font-bold">{item.correctAnswer}</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400"><Brain size={14} /></div>                    <p className="text-slate-500 dark:text-slate-400 text-xs"><span className="text-slate-900 dark:text-white font-bold">{item.term}</span>: {item.meaning}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 dark:bg-white/2 bg-slate-50 border-t border-slate-200 dark:border-white/5 flex justify-end">
            <Button onClick={() => setSelectedSession(null)} className="bg-white text-black hover:bg-slate-200 rounded-xl px-8 font-black uppercase text-xs tracking-widest border border-slate-200">Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MiniTestHistoryPage;
