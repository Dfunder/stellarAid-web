"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

function AuthSync() {
  const { data: session, status } = useSession();
  const { login, isAuthenticated, token: storeToken } = useAuthStore();

  useEffect(() => {
    // If NextAuth has a session but Zustand doesn't have a token, sync!
    if (status === "authenticated" && session) {
      const backendToken = (session as any).backendToken;
      const backendUser = (session as any).backendUser;

      if (backendToken && (!isAuthenticated || storeToken !== backendToken)) {
        login(backendUser, backendToken);
      }
    }
  }, [status, session, login, isAuthenticated, storeToken]);

  return null;
}

export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthSync />
      {children}
    </SessionProvider>
  );
}
