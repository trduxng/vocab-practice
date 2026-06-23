"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, Clock, FileText } from "lucide-react";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import { Card, CardContent } from "@/src/components/ui/card";
import { generatePageNumbers } from "@/src/lib/pagination";

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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    userService.getMiniTests(page, pageSize)
      .then((result) => {
        if (cancelled) return;
        setTests(result.data || []);
        setTotalPages(result.totalPages || 1);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to fetch mini tests", error);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user, page, pageSize]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white">
        Đang xác thực...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950">
      <Topbar
        title="Bài kiểm tra ngắn"
        role="student"
        userName={user?.fullName}
      />

      <main className="p-6 space-y-6 overflow-auto max-w-5xl mx-auto w-full">
        <div className="group relative overflow-hidden rounded-[30px] bg-linear-to-br from-blue-700 via-indigo-700 to-violet-800 p-8 text-white shadow-xl shadow-blue-900/15">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-white/5 via-transparent to-white/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-tight mb-2 text-balance">
              Thử thách trình độ của bạn
            </h2>
            <p className="text-blue-100/80 text-sm max-w-md leading-relaxed">
              Làm bài kiểm tra ngắn sau mỗi chủ đề để xem bạn đã nhớ được bao nhiêu.
            </p>
          </div>
          <FileText
            size={180}
            className="absolute -right-10 -bottom-10 text-white opacity-5 rotate-12 transition-all duration-500 group-hover:scale-110 group-hover:opacity-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-white/10 animate-pulse" />
                    <div className="w-16 h-5 rounded bg-slate-200 dark:bg-white/10 animate-pulse" />
                  </div>
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                  <div className="h-8 w-full bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                  <div className="h-12 w-full bg-slate-200 dark:bg-white/10 rounded-2xl animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : tests.length > 0 ? (
            tests.map((test) => (
              <article
                key={test.id}
                className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-blue-500/30"
              >
                <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-blue-500/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <div className="relative p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/15 to-indigo-500/10 border border-blue-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <FileText size={24} className="text-blue-500" />
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 font-black uppercase tracking-widest border border-slate-200 dark:bg-white/10 dark:border-white/10 dark:text-slate-400">
                      {test.topicName || "Tổng hợp"}
                    </span>
                  </div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {test.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 mb-6 h-8">
                    {test.description ||
                      "Ôn tập kiến thức đã học qua các câu hỏi trắc nghiệm và điền từ."}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-6">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-blue-500" /> 10 phút
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={12} className="text-blue-500" /> {test.totalQuestions || 0} câu
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/user/minitests/${test.id}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-4 text-[11px] font-black uppercase tracking-widest text-slate-700 transition-all duration-300 hover:border-blue-500 hover:bg-blue-600 hover:text-white dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-600 dark:hover:text-white"
                  >
                    Bắt đầu làm bài <ChevronRight size={14} />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-2 py-20 text-center text-slate-500 dark:text-slate-600 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl">
              <FileText size={48} className="mx-auto mb-4 opacity-10" />
              <p>Hiện chưa có bài kiểm tra nào được xuất bản.</p>
            </div>
          )}
        </div>
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </button>

            <div className="flex items-center gap-1">
              {generatePageNumbers(page, totalPages).map((item, index) =>
                item === "..." ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-xs text-slate-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(Number(item))}
                    className={`flex h-9 min-w-9 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      page === item
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-white"
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MiniTestsPage;
