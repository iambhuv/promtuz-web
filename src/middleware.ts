import { NextResponse, type NextRequest } from 'next/server'
import jwt from "jsonwebtoken";

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  const data = jwt.decode(token || '')

  // if (!data || typeof data !== 'string' && data.exp! * 1000 < Date.now()) {
  //   const login_response = NextResponse.redirect(new URL('/login', request.url))
  //   login_response.cookies.delete("token");

  //   return login_response
  // }


  if (!token && !pathname.startsWith('/login') && !pathname.startsWith("/register")) {
    return Response.redirect(new URL(`/login?redirect_path=${encodeURIComponent(pathname)}`, request.url))
  }

  if (token && (pathname.startsWith('/login') || pathname.startsWith("/register"))) {
    return Response.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}