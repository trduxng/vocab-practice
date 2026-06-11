"use client";

import { useState } from "react";
import type { GamificationReward } from "@/src/modules/user/types";
import { userService } from "@/src/services/user.service";
import AchievementModal from "./AchievementModal";
import XPAnimation from "./XPAnimation";

export default function GamificationCelebration({ reward }: { reward: GamificationReward | null | undefined }) {
  const [dismissedEventId, setDismissedEventId] = useState<number | null>(null);
  const achievements = reward?.unlockedAchievements || [];
  const showModal = achievements.length > 0 && dismissedEventId !== reward?.xpEventId;

  return (
    <>
      <XPAnimation amount={reward?.xpGained || 0} animationKey={reward?.xpEventId} />
      {showModal && (
        <AchievementModal
          achievements={achievements}
          onClose={() => {
            setDismissedEventId(reward?.xpEventId || 0);
            void userService.markAchievementsSeen(achievements.map((achievement) => achievement.id));
          }}
        />
      )}
    </>
  );
}
