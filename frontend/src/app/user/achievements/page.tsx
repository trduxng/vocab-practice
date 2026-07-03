"use client";

import { useCallback, useEffect, useState } from "react";
import { Award, Flame, Sparkles, Target } from "lucide-react";
import Topbar from "@/src/components/shared/Topbar";
import { useAuth } from "@/src/app/context/AuthContext";
import AchievementModal from "@/src/components/user/gamification/AchievementModal";
import BadgeCard from "@/src/components/user/gamification/BadgeCard";
import LevelProgressBar from "@/src/components/user/gamification/LevelProgressBar";
import { userService } from "@/src/services/user.service";
import type { Achievement, GamificationProfile } from "@/src/modules/user/types";

export default function UserAchievements() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [modalAchievements, setModalAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getGamificationProfile();
      setProfile(data);
      setModalAchievements(data.unseenAchievements);
    } catch (error) {
      console.error("Failed to fetch achievements", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const timeout = window.setTimeout(() => {
      void fetchProfile();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [fetchProfile, user]);

  if (authLoading || loading || !profile) {
    return <AchievementsSkeleton />;
  }

  const unlockedCount = profile.achievements.filter((achievement) => achievement.unlocked).length;

  return (
    <div className="flex flex-1 flex-col bg-slate-100 dark:bg-slate-950">
      <Topbar title="Thành tích và huy hiệu" subtitle="Theo dõi XP, cấp độ và các cột mốc học tập." role="student" userName={user?.fullName} />
      <main className="mx-auto w-full max-w-6xl space-y-6 overflow-auto p-4 sm:p-6">
        <section className="rounded-[28px] border border-amber-200 bg-linear-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm dark:border-amber-500/20 dark:from-amber-500/10 dark:via-white/[0.04] dark:to-orange-500/10 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                <Award className="h-7 w-7" />
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Bảng thành tích</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Học từ mới, hoàn thành phiên luyện tập và chinh phục mini test để nhận XP và mở khóa huy hiệu.
              </p>
            </div>
            <LevelProgressBar {...profile} />
          </div>
        </section>

        <div className="grid grid-cols-3 gap-3">
          <Metric icon={Sparkles} label="Tổng XP" value={profile.totalXP} tone="amber" />
          <Metric icon={Flame} label="Chuỗi ngày" value={`${profile.streak} ngày`} tone="rose" />
          <Metric icon={Target} label="Huy hiệu" value={`${unlockedCount}/${profile.achievements.length}`} tone="emerald" />
        </div>

        <section>
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">Bộ sưu tập huy hiệu</p>
            <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">Các cột mốc của bạn</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {profile.achievements.map((achievement) => (
              <BadgeCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </section>
      </main>

      <AchievementModal
        achievements={modalAchievements}
        onClose={() => {
          void userService.markAchievementsSeen(modalAchievements.map((achievement) => achievement.id));
          setModalAchievements([]);
        }}
      />
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  tone: "amber" | "rose" | "emerald";
}) {
  const styles = {
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-4">
      <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${styles[tone]}`}><Icon className="h-4 w-4" /></div>
      <p className="mt-3 text-xl font-black text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}

function AchievementsSkeleton() {
  return (
    <div className="flex flex-1 flex-col bg-slate-100 p-6 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl animate-pulse">
        <div className="h-56 rounded-[28px] bg-slate-200 dark:bg-white/10" />
        <div className="mt-5 grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-28 rounded-2xl bg-slate-200 dark:bg-white/10" />)}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-56 rounded-3xl bg-slate-200 dark:bg-white/10" />)}
        </div>
      </div>
    </div>
  );
}
