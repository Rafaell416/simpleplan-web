'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <Header title="Reset Password" />
        <div className="flex-1 flex flex-col pt-24 pb-20 md:pb-32">
          <div className="w-full max-w-md mx-auto px-6 py-8">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-foreground">
                Check your email
              </h1>
              <p className="text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to reset your password.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header title="Reset Password" />
      <div className="flex-1 flex flex-col pt-24 pb-20 md:pb-32">
        <div className="w-full max-w-md mx-auto px-6 py-8">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Reset Password
              </h1>
              <p className="text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
