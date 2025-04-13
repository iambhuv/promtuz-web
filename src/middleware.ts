import { type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  // const data = jwt.decode(token || '')

  // if (!data || typeof data !== 'string' && data.exp! * 1000 < Date.now()) {
  //   const login_response = NextResponse.redirect(new URL('/login', request.url))
  //   login_response.cookies.delete("token");

  //   return login_response
  // }
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isHome = pathname === '/';

  if (!isAuthPage) {
    if (!token) return Response.redirect(new URL(`/login?redirect_path=${encodeURIComponent(pathname)}`, request.url));
    if (isHome && token) return Response.redirect(new URL('/app', request.url));
  }

  if (token && isAuthPage) {
    return Response.redirect(new URL('/app', request.url));
  }

}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}