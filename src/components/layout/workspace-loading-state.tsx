import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type WorkspaceLoadingStateProps = {
  className?: string;
  /** Number of stat cards to show (default: 4) */
  statCount?: number;
  /** Whether to show the header skeleton (default: true) */
  showHeader?: boolean;
  /** Layout variant for the main content area */
  layout?: "single" | "two-column" | "three-column" | "dashboard";
  /** Height override for content area */
  contentHeight?: number;
};

/**
 * WorkspaceLoadingState - Consistent loading skeleton for workspace pages
 * 
 * Provides a stable loading layout that:
 * - Maintains visual structure during loading
 * - Uses consistent skeleton patterns
 * - Prevents layout shift when content loads
 * 
 * Use in loading.tsx files or when data is being fetched.
 */
export function WorkspaceLoadingState({
  className,
  statCount = 4,
  showHeader = true,
  layout = "dashboard",
  contentHeight,
}: WorkspaceLoadingStateProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      {showHeader && (
        <section className="hero-mesh rounded-[1.6rem] p-[1px] shadow-[0_18px_55px_rgba(11,42,74,0.08)]">
          <div className="rounded-[1.52rem] bg-white/92 p-5 dark:bg-[#101c2c]/88 sm:p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-36 rounded-full" />
              <Skeleton className="h-9 w-72 rounded-xl" />
              <Skeleton className="h-4 max-w-2xl rounded-full" />
              <Skeleton className="h-4 w-[85%] max-w-3xl rounded-full" />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Skeleton className="h-10 w-36 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-40 rounded-xl" />
            </div>
          </div>
        </section>
      )}

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: statCount }).map((_, index) => (
          <div
            key={index}
            className="h-28 rounded-[1.35rem] border border-border/70 bg-card p-4"
          >
            <div className="flex h-full flex-col justify-between">
              <Skeleton className="h-3 w-24 rounded-full" />
              <div className="flex items-end justify-between">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      {layout === "single" && (
        <div
          className="rounded-[1.5rem] border border-border/70 bg-card p-5"
          style={{ minHeight: contentHeight ?? 400 }}
        >
          <div className="space-y-4">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      )}

      {layout === "two-column" && (
        <div className="grid gap-6 xl:grid-cols-[1.45fr_.95fr]">
          <div className="space-y-6">
            <div
              className="rounded-[1.5rem] border border-border/70 bg-card p-5"
              style={{ minHeight: contentHeight ?? 320 }}
            >
              <Skeleton className="mb-4 h-6 w-40 rounded-lg" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            </div>
            <div className="h-56 rounded-[1.5rem] border border-border/70 bg-card p-5">
              <Skeleton className="mb-4 h-6 w-32 rounded-lg" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="h-52 rounded-[1.5rem] border border-border/70 bg-card p-5">
              <Skeleton className="mb-4 h-6 w-28 rounded-lg" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            </div>
            <div className="h-72 rounded-[1.5rem] border border-border/70 bg-card p-5">
              <Skeleton className="mb-4 h-6 w-36 rounded-lg" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {layout === "three-column" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="rounded-[1.5rem] border border-border/70 bg-card p-5"
              style={{ minHeight: contentHeight ?? 400 }}
            >
              <Skeleton className="mb-4 h-6 w-32 rounded-lg" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {layout === "dashboard" && (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="h-64 rounded-[1.5rem] border border-border/70 bg-card p-5">
              <Skeleton className="mb-4 h-6 w-40 rounded-lg" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            </div>
            <div className="h-80 rounded-[1.5rem] border border-border/70 bg-card p-5">
              <Skeleton className="mb-4 h-6 w-32 rounded-lg" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="h-52 rounded-[1.5rem] border border-border/70 bg-card p-5">
              <Skeleton className="mb-4 h-6 w-28 rounded-lg" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            </div>
            <div className="h-72 rounded-[1.5rem] border border-border/70 bg-card p-5">
              <Skeleton className="mb-4 h-6 w-36 rounded-lg" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact loading state for cards and panels
 */
export function CardLoadingState({ 
  rows = 3,
  className,
}: { 
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-full" />
            <Skeleton className="h-3 w-1/2 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * List item skeleton for queue/list loading states
 */
export function ListItemSkeleton({ 
  count = 3,
  className,
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3 rounded-full" />
            <Skeleton className="h-3 w-1/3 rounded-full" />
          </div>
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/**
 * Form loading state with field skeletons
 */
export function FormLoadingState({ 
  fields = 4,
  className,
}: { 
  fields?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4 p-4", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
}
