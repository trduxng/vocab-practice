"use client";

import React from "react";

type ProgressData = {
  totalLearned: number;
  accuracy: number;
  streak: number;
  correct: number;
  wrong: number;
  weakWords: { word: string; meaning: string }[];
};

// 👉 demo data (sau này replace bằng API / DB)
const data: ProgressData = {
  totalLearned: 42,
  accuracy: 78,
  streak: 5,
  correct: 156,
  wrong: 44,
  weakWords: [
    { word: "Ambiguous", meaning: "Mơ hồ" },
    { word: "Eloquent", meaning: "Hùng hồn" },
    { word: "Proficient", meaning: "Thành thạo" },
  ],
};

const UserProgress = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 py-10 text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* TITLE */}
        <h1 className="text-4xl font-bold text-center">Tiến độ học</h1>

        {/* OVERVIEW */}
        <div className="grid grid-cols-3 gap-4">
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

        {/* PROGRESS BAR */}
        <div className="bg-white/5 p-5 rounded-xl border border-white/10">
          <p className="text-sm text-slate-400 mb-2">Tỉ lệ đúng</p>

          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-green-400 to-cyan-400"
              style={{ width: `${data.accuracy}%` }}
            />
          </div>
        </div>

        {/* STATS */}
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

        {/* WEAK WORDS */}
        <div className="bg-white/5 p-5 rounded-xl border border-white/10">
          <h2 className="text-lg font-semibold mb-4 text-red-400">
            Từ cần ôn lại
          </h2>

          {data.weakWords.length === 0 ? (
            <p className="text-slate-400 text-sm">Không có</p>
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
};

export default UserProgress;
