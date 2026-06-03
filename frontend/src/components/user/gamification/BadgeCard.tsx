import { LockKeyhole, ShieldCheck } from "lucide-react";
import type { Achievement } from "@/src/modules/user/types";

export default function BadgeCard({ achievement }: { achievement: Achievement }) {
  return (
    <article className={`rounded-3xl border bg-white p-5 shadow-sm transition-all dark:bg-white/[0.04] ${achievement.unlocked ? "border-amber-200 dark:border-amber-500/20" : "border-slate-200 opacity-70 dark:border-white/10"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${achievement.unlocked ? "bg-amber-100 dark:bg-amber-500/15" : "bg-slate-100 text-slate-400 dark:bg-white/5"}`}>
          {achievement.unlocked ? achievement.icon : <LockKeyhole className="h-5 w-5" />}
        </div>
        {achievement.unlocked && <ShieldCheck className="h-5 w-5 text-emerald-500" />}
      </div>
      <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">{achievement.label}</h3>
      <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500 dark:text-slate-400">{achievement.description}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-400" style={{ width: `${achievement.progressPercentage || 0}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400">
        <span>{achievement.progress || 0}/{achievement.target || 0}</span>
        <span>{achievement.unlocked ? "Đã mở khóa" : `${achievement.progressPercentage || 0}%`}</span>
      </div>
    </article>
  );
}
