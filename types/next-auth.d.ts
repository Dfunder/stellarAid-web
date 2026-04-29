import type { DefaultSession } from 'next-auth';
import type { User as AppUser } from '@/types';

declare module 'next-auth' {
  interface Session {
    backendToken?: string;
    backendUser?: AppUser;
    user: {
      id?: string;
    } & DefaultSession['user'];
  }

  interface User {
    backendToken?: string;
    backendUser?: AppUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    backendToken?: string;
    backendUser?: AppUser;
  }
}
