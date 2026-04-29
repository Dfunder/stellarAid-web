import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { authApi } from "@/lib/api/auth";
import type { User } from '@/types';

type BackendAwareUser = User & {
  backendToken?: string;
  backendUser?: User;
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          // If the tokens are available, we pass them to backend
          const idToken = account.id_token || account.access_token;
          if (!idToken) return false;

          // Call backend's social login
          const response = await authApi.socialLogin({
            provider: account.provider,
            token: idToken,
          });

          // Store the backend's result in the user object for the session/jwt callback
          const enrichedUser = user as BackendAwareUser;
          enrichedUser.backendToken = response.data.token;
          enrichedUser.backendUser = response.data.user;
          return true;
        } catch (error) {
          console.error("Social login failed:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const enrichedUser = user as BackendAwareUser;
        token.backendToken = enrichedUser.backendToken;
        token.backendUser = enrichedUser.backendUser;
      }
      return token;
    },
    async session({ session, token }) {
      session.backendToken = token.backendToken;
      session.backendUser = token.backendUser;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
