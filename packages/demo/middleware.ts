// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Handle CORS
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Example: Protect specific paths
  if (req.nextUrl.pathname.startsWith('/api/protected')) {
    const authToken = req.cookies.get('session');
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return response;
}
