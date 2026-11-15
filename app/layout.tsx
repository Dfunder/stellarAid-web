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

export const metadata: Metadata = {
  title: {
    default: "StellarAid — Blockchain-powered crowdfunding",
    template: "%s | StellarAid",
  },
  description:
    "Open-source crowdfunding on the Stellar network: raise funds in XLM or any Stellar asset, with every donation verifiable on-chain.",
  applicationName: "StellarAid",
  openGraph: {
    title: "StellarAid — Blockchain-powered crowdfunding",
    description:
      "Raise funds in XLM or any Stellar asset and let donors verify every contribution on-chain.",
    siteName: "StellarAid",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "StellarAid — Blockchain-powered crowdfunding",
    description:
      "Raise funds in XLM or any Stellar asset and let donors verify every contribution on-chain.",
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
