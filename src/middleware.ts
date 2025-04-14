import jwt from 'jsonwebtoken';
import { type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  const data = jwt.decode(token || '');

  const isTokenExpired = !data || typeof data == 'string' || !data.sid || data.exp! * 1000 <= Date.now();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isHome = pathname === '/';

  if (isTokenExpired) {
    request.cookies.delete('token')
  }

  if (!isAuthPage) {
    if (isTokenExpired) return Response.redirect(new URL(`/login?redirect_path=${encodeURIComponent(pathname)}`, request.url));
    if (isHome && !isTokenExpired) return Response.redirect(new URL('/app', request.url));
  }

  if (!isTokenExpired && isAuthPage) {
    return Response.redirect(new URL('/app', request.url));
  }

}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}