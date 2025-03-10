
import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Routes that are public and don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/mfa-verification',
  '/api/login',
  '/api/register',
  '/api/verify-mfa',
  '/_next',
  '/static',
  '/favicon.ico',
];

// Routes that require admin privileges
const adminRoutes = [
  '/admin',
  '/api/admin',
  '/api/users',
];

// Routes that require driver privileges
const driverRoutes = [
  '/driver',
  '/api/driver',
];

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Allow public routes
  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check for Authorization header or cookie
  const authHeader = request.headers.get('authorization');
  const cookie = request.cookies.get('auth_token');
  let token = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (cookie) {
    token = cookie.value;
  }
  
  // Redirect to login if no token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    // Verify token and check user role
    const decoded = jwtDecode(token);
    const { role } = decoded;
    
    // Check if admin route but user is not admin
    if (adminRoutes.some(route => path.startsWith(route)) && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Check if driver route but user is not driver
    if (driverRoutes.some(route => path.startsWith(route)) && role !== 'driver' && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Continue with the request
    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    console.error('Error verifying token:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api/auth routes
     * 2. /_next (Next.js internals)
     * 3. /_static (static files)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /manifest.json (browser requests)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
