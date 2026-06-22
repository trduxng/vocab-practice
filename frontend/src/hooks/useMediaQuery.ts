"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True when viewport >= 1024px (desktop) */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

/** True when viewport >= 768px and < 1024px (tablet) */
export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023.98px)");
}

/** True when viewport < 768px (mobile) */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767.98px)");
}

/** True when viewport >= 768px */
export function useIsMdOrAbove(): boolean {
  return useMediaQuery("(min-width: 768px)");
}
