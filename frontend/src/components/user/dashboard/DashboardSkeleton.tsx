import { Skeleton } from "@/src/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[320px] rounded-[28px] sm:h-[270px]" />
      <div>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-2 h-6 w-60" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-3xl" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-[340px] rounded-[28px]" />
        <Skeleton className="h-[340px] rounded-[28px]" />
        <Skeleton className="h-[340px] rounded-[28px]" />
      </div>
    </div>
  );
}
