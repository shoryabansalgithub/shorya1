import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    authError?: string;
    user: {
      id: string;
      role: string;
      shopId: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
    shopId: string;
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    shopId?: string;
    accessToken?: string;
    refreshToken?: string;
    authError?: string;
  }
}
