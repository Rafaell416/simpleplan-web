import { Header } from '@/components/Header';

export default function SettingsPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 font-sans text-neutral-900 dark:bg-black dark:text-white">
      <Header title="Settings" />
      <div className="flex-1 flex items-center justify-center pt-24 pb-32">
        <div className="w-full max-w-2xl mx-auto px-6 py-8">
          {/* Settings content here */}
        </div>
      </div>
    </main>
  );
}