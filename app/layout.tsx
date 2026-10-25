import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { getAbout } from "@/lib/sanity";
import { SITE_URL } from "@/lib/seo/siteUrl";

import "./globals.scss";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const FALLBACK_SITE_NAME = "Matt Chan";

// Site-wide defaults from the About singleton. Pages override title,
// description and OG image through their own metadata.
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
    >
      <body>{children}</body>
    </html>
  );
}
