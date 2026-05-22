import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
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
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    shopId?: string;
    accessToken?: string;
  }
}
