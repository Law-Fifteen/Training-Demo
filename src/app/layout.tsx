import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeToggle } from "@/components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Law Nine Sales Methodology",
  description: "Master the art of sales through proven methodologies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen bg-background">
            {/* Header with Theme Toggle */}
            <header className="sticky top-0 z-20 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="leading-tight">
                    <div className="text-2xl font-bold gradient-text">Law Nine</div>
                    <div className="text-sm font-semibold text-muted">Sales Method</div>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </header>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
