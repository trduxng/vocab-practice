// vocab-practice/frontend/src/app/user/progress/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { userService } from "@/src/services/user.service";
import type { UserProgress } from "@/src/services/user.service";

export default function UserProgress() {
  const [data, setData] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProgress() {
      try {
        setLoading(true);
        setError(null);
        const progress = await userService.getProgress();
        setData(progress);
      } catch (err: unknown) {
        console.error("Failed to fetch progress:", err);
        setError("Không thể tải dữ liệu tiến độ.");
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-brand-600 rounded-xl"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-white">
        <p>Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 py-10 text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center">Tiến độ học</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 p-5 rounded-xl border border-white/10 text-center">
            <p className="text-slate-400 text-sm">Từ đã học</p>
            <p className="text-2xl font-bold">{data.totalLearned}</p>
          </div>
          <div className="bg-white/5 p-5 rounded-xl border border-white/10 text-center">
            <p className="text-slate-400 text-sm">Accuracy</p>
            <p className="text-2xl font-bold text-green-400">
              {data.accuracy}%
            </p>
          </div>
          <div className="bg-white/5 p-5 rounded-xl border border-white/10 text-center">
            <p className="text-slate-400 text-sm">Streak</p>
            <p className="text-2xl font-bold text-orange-400">
              {data.streak} ngày
            </p>
          </div>
        </div>

        <div className="bg-white/5 p-5 rounded-xl border border-white/10">
          <p className="text-sm text-slate-400 mb-2">Tỉ lệ đúng</p>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-green-400 to-cyan-400 transition-all duration-500"
              style={{ width: `${data.accuracy}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 p-5 rounded-xl">
            <p className="text-green-300 text-sm">Đúng</p>
            <p className="text-2xl font-bold">{data.correct}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-xl">
            <p className="text-red-300 text-sm">Sai</p>
            <p className="text-2xl font-bold">{data.wrong}</p>
          </div>
        </div>

        <div className="bg-white/5 p-5 rounded-xl border border-white/10">
          <h2 className="text-lg font-semibold mb-4 text-red-400">
            Từ cần ôn lại
          </h2>
          {data.weakWords.length === 0 ? (
            <p className="text-slate-400 text-sm">
              Không có từ nào cần ôn lại. Tiếp tục phát huy!
            </p>
          ) : (
            <ul className="space-y-2">
              {data.weakWords.map((w, i) => (
                <li
                  key={i}
                  className="flex justify-between text-sm bg-white/5 px-4 py-2 rounded-lg"
                >
                  <span className="font-medium">{w.word}</span>
                  <span className="text-slate-400">{w.meaning}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
