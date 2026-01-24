'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { ArrowLeft, Mail } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';

export default function ContactSettingsPage() {
  return (
    <AuthGuard>
      <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header title="Contact Us" />
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
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Contact Us
              </h2>
              <p className="text-muted-foreground mb-6">
                Get in touch with our support team
              </p>
              <div className="space-y-4 text-left max-w-md mx-auto">
                <div className="p-4 rounded-lg border border-border bg-card">
                  <h3 className="font-medium text-foreground mb-2">Email Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Send us an email at{' '}
                    <a
                      href="mailto:rvillarreal416@gmail.com"
                      className="text-primary hover:underline"
                    >
                      rvillarreal416@gmail.com
                    </a>
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <h3 className="font-medium text-foreground mb-2">Response Time</h3>
                  <p className="text-sm text-muted-foreground">
                    We typically respond within 24-48 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </AuthGuard>
  );
}

