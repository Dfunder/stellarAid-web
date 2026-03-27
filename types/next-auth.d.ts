import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    backendToken?: string;
    backendUser?: any;
    user: {
      id?: string;
    } & DefaultSession["user"];
  }

  interface User {
    backendToken?: string;
    backendUser?: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
    backendUser?: any;
  }
}
