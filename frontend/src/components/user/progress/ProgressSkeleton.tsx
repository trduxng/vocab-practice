export default function ProgressSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-64 rounded-[30px] bg-slate-200 dark:bg-white/[0.06]" />
      <div className="h-72 rounded-[28px] bg-slate-200 dark:bg-white/[0.06]" />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-96 rounded-[28px] bg-slate-200 dark:bg-white/[0.06]" />
        <div className="h-96 rounded-[28px] bg-slate-200 dark:bg-white/[0.06]" />
      </div>
      <div className="h-72 rounded-[28px] bg-slate-200 dark:bg-white/[0.06]" />
    </div>
  );
}
