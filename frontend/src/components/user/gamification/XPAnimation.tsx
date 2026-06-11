"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export default function XPAnimation({ amount, animationKey }: { amount: number; animationKey?: string | number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (amount <= 0) return;
    const showTimer = window.setTimeout(() => setVisible(true), 0);
    const hideTimer = window.setTimeout(() => setVisible(false), 1500);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [amount, animationKey]);

  if (!visible || amount <= 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[80] flex justify-center">
      <div className="animate-in fade-in zoom-in-75 slide-in-from-bottom-4 flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-400 px-5 py-2.5 text-lg font-black text-amber-950 shadow-2xl shadow-amber-500/30 duration-500">
        <Sparkles className="h-5 w-5" />
        +{amount} XP
      </div>
    </div>
  );
}
