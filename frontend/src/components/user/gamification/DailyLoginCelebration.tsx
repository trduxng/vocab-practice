"use client";

import { useEffect, useState } from "react";
import type { GamificationReward } from "@/src/modules/user/types";
import GamificationCelebration from "./GamificationCelebration";

const STORAGE_KEY = "pendingGamificationReward";

export default function DailyLoginCelebration() {
  const [reward, setReward] = useState<GamificationReward | null>(null);

  useEffect(() => {
    const rawReward = localStorage.getItem(STORAGE_KEY);
    if (!rawReward) return;
    localStorage.removeItem(STORAGE_KEY);
    try {
      const parsed = JSON.parse(rawReward) as GamificationReward;
      if (!parsed.awarded) return;
      const timer = window.setTimeout(() => setReward(parsed), 0);
      return () => window.clearTimeout(timer);
    } catch {
      // Ignore invalid storage written by an older client.
    }
  }, []);

  return <GamificationCelebration reward={reward} />;
}
