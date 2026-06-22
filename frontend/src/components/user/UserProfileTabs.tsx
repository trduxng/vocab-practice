"use client";

import type { ElementType, ReactNode } from "react";

export interface TabConfig {
  id: string;
  label: string;
  icon: ElementType;
}

export default function UserProfileTabs({
  tabs,
  activeTab,
  onTabChange,
  children,
}: {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}) {
  return (
    <div>
      {/* Tab bar */}
      <div className="sticky top-0 z-20 -mx-4 -mt-4 mb-6 bg-slate-100 px-4 pt-4 pb-4 dark:bg-slate-950 sm:-mx-6 sm:-mt-6 sm:px-6">
        <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all sm:px-4 sm:text-xs ${
                  isActive
                    ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 2)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active tab content */}
      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
        {children}
      </div>
    </div>
  );
}
