import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Roboto, Open_Sans } from "next/font/google";
import "./globals.css";
import { DockBar } from "@/components/DockBar";
import { TabBar } from "@/components/TabBar";
import { SettingsProvider } from "@/components/SettingsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SimplePlan",
  description: "Todo list for your life",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${roboto.variable} ${openSans.variable} antialiased`}
      >
        <SettingsProvider>
          <main className="relative min-h-screen bg-background text-foreground">
            {children}
          </main>
          <DockBar />
          <TabBar />
        </SettingsProvider>
      </body>
    </html>
  );
}
