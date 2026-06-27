import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ReduxProvider } from "./providers/ReduxProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StellarAid",
  description: "Blockchain-based crowdfunding on the Stellar Network",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          {children}
          <Toaster
          position="top-right"
          toastOptions={{
            // StellarAid theme styling
            success: {
              style: {
                background: '#10b981', // emerald-500
                color: '#ffffff',
                fontWeight: '500',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              },
            },
            error: {
              style: {
                background: '#ef4444', // red-500
                color: '#ffffff',
                fontWeight: '500',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              },
            },
            loading: {
              style: {
                background: '#3b82f6', // blue-500
                color: '#ffffff',
                fontWeight: '500',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              },
            },
            // Default style for info toasts
            style: {
              background: '#0ea5e9', // sky-500
              color: '#ffffff',
              fontWeight: '500',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              padding: '12px 16px',
              fontSize: '14px',
              maxWidth: '400px',
            },
            duration: 4000,
          }}
         />
        </ReduxProvider>
       </body>
    </html>
  );
}