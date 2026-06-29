// export default function PublicLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen bg-bg-base">
//       {children}
//     </div>
//   );
// }

import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Arogyanvesha – Your Ayurvedic Health Companion",
    template: "%s | Arogyanvesha",
  },
  description:
    "Discover your Prakriti, get personalised Ayurvedic insights, and track your holistic wellness journey with AI-powered guidance.",
  keywords: ["Ayurveda", "Prakriti", "holistic health", "wellness", "Dosha"],
  authors: [{ name: "Arogyanvesha" }],
  creator: "Arogyanvesha",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Arogyanvesha",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FEFCF8" },
    { media: "(prefers-color-scheme: dark)",  color: "#0F1A12" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
      FIX: Added data-scroll-behavior="smooth" to suppress the Next.js 16
      route-transition warning. Next.js detects scroll-behavior: smooth on
      <html> and warns that it can interfere with its own scroll restoration
      during client-side navigations. The fix is a two-part change:
        1. Add data-scroll-behavior="smooth" here.
        2. In globals.css, scope the scroll-behavior rule to
           html[data-scroll-behavior="smooth"] instead of bare html {}.
      This preserves smooth anchor scrolling while letting Next.js manage
      scroll position during page transitions.
    */
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Skip to main content — accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}