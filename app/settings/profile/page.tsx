'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { ArrowLeft, LogOut, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/AuthGuard';

export default function ProfileSettingsPage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Force a full page reload to the landing page to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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

          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : user ? (
              <>
                {/* User Info */}
                <div className="p-6 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        {user.email}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Signed in
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="p-6 rounded-lg border border-border bg-card">
                  <h3 className="font-medium text-foreground mb-4">Account</h3>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
