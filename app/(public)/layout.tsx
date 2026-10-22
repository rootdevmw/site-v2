import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { Suspense } from "react";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicWatchLink } from "@/components/public/PublicWatchLink";
import { PublicJourneyEvents } from "@/components/public/PublicJourneyEvents";
import { church } from "@/config/church";
import "@/styles/public.css";

const bodyFont = localFont({
  src: "../../public/fonts/manrope-variable.ttf",
  variable: "--font-public-body",
  weight: "200 800",
  display: "swap",
});
const headingFont = localFont({
  src: "../../public/fonts/lora-variable.ttf",
  variable: "--font-public-heading",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(church.siteUrl),
  openGraph: {
    siteName: church.name,
    type: "website",
    locale: "en_MW",
    title: church.name,
    description: "A church family in Blantyre, Malawi. All are welcome.",
  },
  twitter: {
    card: "summary_large_image",
    title: church.name,
  },
  title: {
    default: "Church of Christ at Red Cross | Blantyre, Malawi",
    template: "%s | Church of Christ at Red Cross",
  },
  description:
    "A church family in Blantyre, Malawi, growing together in Christ through worship, Scripture, fellowship, and service. Plan your visit and find a place to belong.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`public-site min-h-screen ${bodyFont.variable} ${headingFont.variable}`}
    >
      <a
        href="#public-content"
        className="sr-only z-50 rounded-lg bg-white p-3 focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <PublicJourneyEvents />
      <PublicHeader
        watchLink={
          <Suspense fallback={<PublicWatchLinkPlaceholder />}>
            <PublicWatchLink />
          </Suspense>
        }
      />
      <main id="public-content" tabIndex={-1}>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}

function PublicWatchLinkPlaceholder() {
  return (
    <Link href="/live" className="public-text-link public-live-link is-offline">
      Live · Checking <span aria-hidden="true">↗</span>
    </Link>
  );
}
