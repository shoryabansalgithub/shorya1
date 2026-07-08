import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
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
