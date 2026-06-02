import { Skeleton } from "@/src/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[390px] rounded-[28px] sm:h-[330px]" />
      <div>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-2 h-6 w-60" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-3xl" />
          ))}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <Skeleton className="h-[430px] rounded-[28px]" />
        <Skeleton className="h-[430px] rounded-[28px]" />
      </div>
    </div>
  );
}
