import { BookOpenCheck, Flame, Sparkles, Trophy } from "lucide-react";
import type { ProgressAnalytics } from "@/src/modules/user/types";

type ProgressHeroProps = {
  summary: ProgressAnalytics["summary"];
};

export default function ProgressHero({ summary }: ProgressHeroProps) {
  return (
    <section className="overflow-hidden rounded-[30px] bg-linear-to-br from-sky-600 via-blue-600 to-indigo-700 p-5 text-white shadow-xl shadow-sky-900/15 sm:p-7">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-100">Learning analytics</p>
      <h1 className="mt-2 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">Theo doi nhip hoc va giu vung tien do moi ngay.</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-sky-100/90">Tong quan 365 ngay gan nhat, xu huong XP, von tu vung va kha nang ghi nho cua ban.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <HeroMetric icon={Flame} value={summary.currentStreak} label="Chuoi ngay hien tai" />
        <HeroMetric icon={Sparkles} value={summary.totalXP} label="Tong XP" />
        <HeroMetric icon={BookOpenCheck} value={summary.learnedWords} label="Tu da hoc" />
        <HeroMetric icon={Trophy} value={summary.masteredWords} label="Tu nam vung" />
      </div>
    </section>
  );
}

function HeroMetric({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur sm:p-4">
      <Icon className="h-4 w-4 text-sky-100" />
      <p className="mt-3 text-2xl font-black">{value.toLocaleString("vi-VN")}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-sky-100/80">{label}</p>
    </div>
  );
}
