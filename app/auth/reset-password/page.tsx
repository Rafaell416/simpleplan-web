'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { updatePassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we have the required hash/token from the email link
    const hash = searchParams.get('hash');
    if (!hash) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await updatePassword(password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    }
  };

  if (success) {
    return (
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <Header title="Password Reset" />
        <div className="flex-1 flex flex-col pt-24 pb-20 md:pb-32">
          <div className="w-full max-w-md mx-auto px-6 py-8">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-foreground">
                Password Updated!
              </h1>
              <p className="text-muted-foreground">
                Redirecting you to the app...
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
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Set New Password
              </h1>
              <p className="text-muted-foreground">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <Header title="Reset Password" />
        <div className="flex-1 flex flex-col pt-24 pb-20 md:pb-32">
          <div className="w-full max-w-md mx-auto px-6 py-8">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
