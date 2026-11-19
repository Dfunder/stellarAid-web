import type { Metadata } from "next";
import localFont from "next/font/local";
import { Footer } from "../components/Footer";
import { siteConfig } from "@/config/site";
import "./globals.css";

// Self-hosted Geist variable fonts (SIL OFL 1.1). The .woff2 files live in
// ./fonts and must be committed; nothing is fetched from Google at build time.
const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
