import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Footer } from "../components/Footer";
import { siteConfig } from "@/config/site";
import "./globals.css";

// Geist and Geist Mono are self-hosted through the `geist` package (SIL OFL 1.1),
// so nothing is fetched from Google at build time. The package exposes the same
// --font-geist-sans / --font-geist-mono CSS variables used by globals.css.

const title = `${siteConfig.name} - ${siteConfig.tagline}`;
const description = siteConfig.description;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    url: "/",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
