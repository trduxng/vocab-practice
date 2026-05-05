"use client";

import { useSyncExternalStore, type ReactNode } from "react";

export default function ChartFrame({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  return (
    <div className={className}>
      {mounted ? children : <div className="h-full w-full animate-pulse rounded-md bg-slate-100 dark:bg-white/5" />}
    </div>
  );
}
