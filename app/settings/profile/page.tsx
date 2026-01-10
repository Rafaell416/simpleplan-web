'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { ArrowLeft } from 'lucide-react';

export default function ProfileSettingsPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header title="Profile" />
      <div className="flex-1 flex flex-col pt-24 pb-20 md:pb-32">
        <div className="w-full max-w-2xl mx-auto px-6 py-8">
          {/* Back Button */}
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>

          {/* Placeholder Content */}
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Profile Settings
              </h2>
              <p className="text-muted-foreground">
                Profile management features will be available soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

