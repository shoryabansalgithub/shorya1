import { NextResponse } from 'next/server';

/**
 * The browser UI supports a guest preview. API routes remain protected by
 * NestJS JWT and tenant guards, so no shop data or write action is exposed
 * without a valid session.
 */
export default function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
