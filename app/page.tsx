'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to home
  useEffect(() => {
    if (!loading && user) {
      router.replace('/home');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex min-h-screen flex-col items-center justify-center font-sans px-6 py-12">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Section with Icon */}
        <div className="space-y-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-2xl p-6 shadow-2xl">
                <svg
                  className="w-16 h-16 md:w-20 md:h-20 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
            </div>
          </div>
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
            href="/auth/signup"
            className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-16 border-t border-neutral-200 dark:border-neutral-800">
          <div className="space-y-4 group">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-50">Organize</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Keep track of all your tasks in one place
            </p>
          </div>
          <div className="space-y-4 group">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-50">Track Progress</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Monitor your goals and see your achievements
            </p>
          </div>
          <div className="space-y-4 group">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-50">Stay Focused</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Simple interface designed for productivity
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
