// React and Next.js
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

// Shared modules
import {
  ENTRANCE_NOSCRIPT_CSS,
  ENTRANCE_SCRIPT,
} from "@/components/features/landing/entrance/entrance-script";
import { getAbout } from "@/lib/sanity";
import { SITE_URL } from "@/lib/seo/siteUrl";

import "./globals.scss";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const FALLBACK_SITE_NAME = "Matt Chan";

/**
 * Builds the site-wide metadata defaults from the About singleton. Pages
 * override title, description and OG image through their own metadata.
 *
 * @returns Next metadata with the base URL, title template and description.
 */
export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  const siteName = about?.siteName?.trim() || FALLBACK_SITE_NAME;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteName,
      template: about?.titleTemplate?.includes("%s")
        ? about.titleTemplate
        : "%s",
    },
    description: about?.defaultMetaDescription?.trim() || undefined,
    openGraph: { siteName },
  };
}

/**
 * The root layout: the `<html>` and `<body>` shell with the site fonts and the
 * pre-hydration Entrance script.
 *
 * @param props.children - The matched route.
 * @returns The document shell around `children`.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable}`}
      // The Entrance script marks <html> before hydration
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: ENTRANCE_SCRIPT }} />
        <noscript>
          <style>{ENTRANCE_NOSCRIPT_CSS}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
