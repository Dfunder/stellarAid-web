import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import NextAuthProvider from "@/components/NextAuthProvider";
import { SessionExpiredModal } from "@/components/SessionExpiredModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "StellarAid",
  description: "Blockchain-based crowdfunding on the Stellar Network",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <NextAuthProvider>
          <ToastProvider>
            {children}
            <SessionExpiredModal />
            <MobileBottomNav />
          </ToastProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
