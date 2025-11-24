import Link from 'next/link';

export default function LandingPage() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center font-sans px-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
            SimplePlan
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Your life, organized in one simple dock.
          </p>
        </div>
        
        <p className="text-base md:text-lg text-neutral-500 dark:text-neutral-500 max-w-xl mx-auto">
          A beautiful, intuitive todo app that helps you stay organized and achieve your goals.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            href="/home"
            className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/goals"
            className="px-8 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            View Goals
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-16 border-t border-neutral-200 dark:border-neutral-800">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Organize</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              Keep track of all your tasks in one place
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Track Progress</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              Monitor your goals and see your achievements
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Stay Focused</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              Simple interface designed for productivity
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
