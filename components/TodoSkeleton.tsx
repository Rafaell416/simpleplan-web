'use client';

export function TodoSkeleton() {
  const widths = ['75%', '85%', '65%', '70%', '80%'];
  
  return (
    <div className="w-full max-w-full">
      <div className="h-8 w-32 bg-muted rounded mb-8 animate-pulse" />
      <div className="space-y-1 px-2">
        {widths.map((width, i) => (
          <div
            key={i}
            className="group flex items-center gap-3 py-1.5 px-2 rounded"
          >
            <div className="flex-shrink-0 w-5 h-5 bg-muted rounded animate-pulse" />
            <div 
              className="flex-1 h-5 bg-muted rounded animate-pulse" 
              style={{ width }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
