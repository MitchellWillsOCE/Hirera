import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Hirera - Manage Your Career Journey",
  description: "A comprehensive job application tracking system to help you manage your job search efficiently. Track applications, analyze progress, and organize your career materials.",
  keywords: ["job tracker", "career management", "job search", "application tracker"],
  authors: [{ name: "Hirera Team" }],
  creator: "Hirera",
  openGraph: {
    title: "Hirera",
    description: "Track and manage your job applications with ease",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  other: {
    'preload': 'true',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preload" href="/grid.svg" as="image" type="image/svg+xml" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800`}
      >
        <SessionProvider>
          <div className="relative">
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 pointer-events-none" />
            
            <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-30" 
                 style={{ willChange: 'transform' }} />
            
            <main className="relative z-10">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
