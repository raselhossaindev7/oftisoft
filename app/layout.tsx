import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ErrorBoundary } from "@/components/error-boundary";
import { defaultMetadata, defaultViewport } from "@/lib/metadata";
import { jsonLdSchemas } from "@/lib/metadata";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional",
  preload: true,
});

import { CartSheet } from "@/components/cart-sheet";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import CookieConsent from "@/components/cookie-consent";
import { QueryProvider } from "@/lib/api/queries";
import { AuthProvider } from "@/components/auth-provider";
import SeoScripts from "@/components/seo-scripts";

export const metadata: Metadata = defaultMetadata;
export const viewport: Viewport = defaultViewport;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      dir="ltr"
      suppressHydrationWarning
    >
      <head>
        <meta name="monetag" content="013c86a4f57c893a653e60cd9e30715d" />
        <meta name="msapplication-TileColor" content="#030014" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdSchemas.organization),
          }}
        />
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdSchemas.website),
          }}
        />
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdSchemas.localBusiness),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SW registered:', reg.scope);
                  }, function(err) {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider forcedTheme={undefined}>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
            Skip to main content
          </a>
          <ErrorBoundary>
            <QueryProvider>
              <AuthProvider>
                <AnalyticsTracker />
                <main id="main-content" tabIndex={-1}>
                  {children}
                </main>
                <CartSheet />
                <CookieConsent />
                <SeoScripts />
              </AuthProvider>
              <Toaster richColors position="top-right" />
            </QueryProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
