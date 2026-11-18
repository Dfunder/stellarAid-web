import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "StellarAid — Blockchain-powered crowdfunding";
const description =
  "StellarAid is a blockchain-powered crowdfunding platform on Stellar, enabling transparent, verifiable on-chain donations for global impact.";

export const metadata: Metadata = {
  metadataBase: new URL("https://stellaraid.vercel.app"),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    url: "/",
    siteName: "StellarAid",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
