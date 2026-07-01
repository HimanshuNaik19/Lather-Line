

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function SkeletonCard({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-surface-input border border-surface-border rounded-xl p-4 animate-pulse ${className}`}
        >
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-border"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-surface-border rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-surface-border rounded w-1/2"></div>
                <div className="h-3 bg-surface-border rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function SkeletonList({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`flex items-center gap-4 py-3 animate-pulse ${className}`}
        >
          <div className="w-10 h-10 rounded-full bg-surface-border flex-shrink-0"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 bg-surface-border rounded w-3/4"></div>
            <div className="h-3 bg-surface-border rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </>
  );
}
