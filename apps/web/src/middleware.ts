import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { AUTH_DISABLED } from '@/lib/auth-bypass';

// When the operator has explicitly disabled auth (AUTH_DISABLED on the API,
// NEXT_PUBLIC_AUTH_DISABLED here), skip the session gate entirely so the user
// lands in the app without logging in. The API runs those requests as its
// system user. Defaults to the authenticated gate whenever the flag is unset.
const passthrough = () => NextResponse.next();

export default AUTH_DISABLED
  ? passthrough
  : withAuth(
      function middleware() {
        return NextResponse.next();
      },
      {
        callbacks: {
          authorized({ token }) {
            return token != null;
          },
        },
        pages: {
          signIn: '/login',
        },
      },
    );

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|login|register).*)',
  ],
};
