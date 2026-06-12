import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ━━━ P0 FIX: Unified isomorphic auth injection ━━━
// Client: uses next-auth/react getSession()
// Server: uses next-auth/jwt getToken() with request cookies
async function resolveToken(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    // Client-side: use next-auth/react
    const { getSession } = await import('next-auth/react');
    const session = await getSession();
    return (session as any)?.accessToken ?? null;
  } else {
    // Server-side: extract token from NextAuth JWT cookie
    try {
      const { cookies } = await import('next/headers');
      const { getToken } = await import('next-auth/jwt');
      const cookieStore = await cookies();
      // Build a minimal request-like object for getToken
      const req = {
        cookies: Object.fromEntries(
          cookieStore.getAll().map((c: any) => [c.name, c.value])
        ),
        headers: {},
      };
      const token = await getToken({
        req: req as any,
        secret: process.env.NEXTAUTH_SECRET,
      });
      return (token as any)?.accessToken ?? null;
    } catch {
      // If next/headers is unavailable (e.g., build-time), skip silently
      return null;
    }
  }
}

// Add request interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await resolveToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Handle unauthorized securely by clearing NextAuth session
      const { signOut } = await import('next-auth/react');
      signOut({ callbackUrl: '/login' });
    }
    return Promise.reject(error);
  }
);

export default apiClient;

