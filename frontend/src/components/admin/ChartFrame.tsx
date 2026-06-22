"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export default function ChartFrame({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      if (offsetWidth > 0 && offsetHeight > 0) {
        setReady(true);
      }
    }
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [measure]);

  return (
    <div ref={containerRef} className={className}>
      {ready ? children : <div className="h-full w-full animate-pulse rounded-md bg-slate-100 dark:bg-white/5" />}
    </div>
  );
}
