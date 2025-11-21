'use client';

export function Header({ title }: { title: string }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      <div className="w-full max-w-2xl mx-auto px-6 pt-8">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 pointer-events-auto">
          {title}
        </h1>
      </div>
    </div>
  );
}