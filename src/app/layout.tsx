import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { siteConfig } from "@/config/site";
import { WalletProvider } from "../components/wallet/WalletProvider";
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
  manifest: "/manifest.webmanifest",
  openGraph: {
    title,
    description,
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("stellaraid:theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch{}',
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <WalletProvider>{children}</WalletProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex flex-1 flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
