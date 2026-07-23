import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

import { clientConfig, serverConfig } from '../config/env';
import { AUTH_DISABLED } from './auth-bypass';

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

// ---- Response interceptor — auto-signout on 401 ----
// Skipped when auth is bypassed: there is no session to sign out of, and
// bouncing to /login would trap the user behind a gate that is disabled.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined' && !AUTH_DISABLED) {
      const { signOut } = await import('next-auth/react');
      await signOut({ callbackUrl: '/login' });
    }
    return Promise.reject(error);
  },
);

export default apiClient;
