'use client';

export function GoalSkeleton() {
  const titleWidths = ['75%', '85%', '70%', '80%', '65%', '90%'];
  
  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" style={{ gridAutoRows: '1fr' }}>
        {/* New Goal Card Skeleton */}
        <div className="rounded-lg p-4 bg-card border border-border h-full min-h-[180px] animate-pulse">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-muted mb-2" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
        </div>

        {/* Goal Cards Skeleton */}
        {titleWidths.map((titleWidth, i) => (
          <div
            key={i}
            className="rounded-lg p-4 bg-card border border-border h-full min-h-[180px] flex flex-col animate-pulse"
          >
            {/* Title */}
            <div className="h-6 bg-muted rounded mb-3 flex-1" style={{ width: titleWidth }} />
            
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full h-2 bg-muted rounded-full" />
            </div>
            
            {/* Footer */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="h-3 w-12 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
