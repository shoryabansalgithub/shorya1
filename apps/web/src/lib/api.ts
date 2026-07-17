import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

import { clientConfig, serverConfig } from '../config/env';

const API_URL = clientConfig.NEXT_PUBLIC_API_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Isomorphic token resolution — extracts the NestJS access token from the
// NextAuth session (client) or JWT cookie (server).
// ---------------------------------------------------------------------------
async function resolveToken(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    // Client-side — read from NextAuth session
    const { getSession } = await import('next-auth/react');
    const session = (await getSession()) as Session | null;
    return session?.accessToken ?? null;
  }

  // Server-side — decode the NextAuth JWT cookie directly
  try {
    const { cookies } = await import('next/headers');
    const { getToken } = await import('next-auth/jwt');
    const cookieStore = await cookies();

    const cookieMap: Record<string, string> = {};
    for (const c of cookieStore.getAll()) {
      cookieMap[c.name] = c.value;
    }

    // next-auth v4 getToken types expect IncomingMessage | NextApiRequest |
    // NextRequest, but at runtime it only accesses req.cookies — the plain
    // object is compatible at this library boundary.
    const token = (await getToken({
      req: { cookies: cookieMap },
      secret: serverConfig.NEXTAUTH_SECRET,
    } as Parameters<typeof getToken>[0])) as JWT | null;
    return token?.accessToken ?? null;
  } catch {
    // next/headers unavailable at build-time — no token to inject
    return null;
  }
}

// ---- Request interceptor — inject Bearer token ----
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await resolveToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---- Response interceptor — expire authenticated sessions on 401 only. ----
// Guests may browse the public shell without a session; redirecting them on a
// protected API response would make the guest experience unusable.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const { getSession, signOut } = await import('next-auth/react');
      const session = await getSession();
      if (session?.accessToken) {
        await signOut({ callbackUrl: '/login' });
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
