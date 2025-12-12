import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

/**
 * PageSkeleton - A full-page loading skeleton for lazy-loaded routes.
 * Provides a better UX than a spinner by showing the page structure.
 */
function PageSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar skeleton */}
      <aside className="w-64 border-r bg-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="space-y-2 pt-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header skeleton */}
        <header className="h-14 border-b bg-card flex items-center px-4 gap-4">
          <div className="flex-1" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </header>

        {/* Content skeleton */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * CardSkeleton - A skeleton for card components.
 */
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("border rounded-lg p-4 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

/**
 * TableSkeleton - A skeleton for table components.
 */
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="border-b bg-muted/30 p-3">
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-3 flex gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-24" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ListSkeleton - A skeleton for list items.
 */
function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton, PageSkeleton, CardSkeleton, TableSkeleton, ListSkeleton };
