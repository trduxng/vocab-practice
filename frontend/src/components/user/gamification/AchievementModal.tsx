"use client";

import { Award, X } from "lucide-react";
import type { Achievement } from "@/src/modules/user/types";

type AchievementModalProps = {
  achievements: Achievement[];
  onClose: () => void;
};

export default function AchievementModal({ achievements, onClose }: AchievementModalProps) {
  if (achievements.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-amber-300/30 bg-white p-6 text-center shadow-2xl dark:bg-slate-900 sm:p-7">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Đóng">
          <X className="h-4 w-4" />
        </button>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
          <Award className="h-8 w-8" />
        </div>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">Thành tích đã mở khóa</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Huy hiệu mới</h2>
        <div className="mt-5 space-y-3">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-left dark:border-amber-500/15 dark:bg-amber-500/[0.07]">
              <div className="text-3xl" aria-hidden="true">{achievement.icon}</div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">{achievement.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={onClose} className="mt-6 min-h-11 w-full rounded-2xl bg-amber-500 px-4 text-xs font-black uppercase tracking-wider text-amber-950 transition-colors hover:bg-amber-400">
          Tiếp tục học
        </button>
      </div>
    </div>
  );
}
