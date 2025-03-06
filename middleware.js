import { NextResponse } from 'next/server';
import * as jwt from 'jwt-decode';

// Define rutas protegidas por rol
const PROTECTED_ROUTES = {
  admin: ['/admin', '/(admin)'],
  driver: ['/driver']
};

export function middleware(request) {
  // Obtener token del localStorage (solo funciona en el cliente)
  // Para el middleware, verificamos si hay una cookie de token
  const token = request.cookies.get('userToken')?.value;

  const { pathname } = request.nextUrl;

  // Si no hay token y es una ruta protegida, redirigir al login
  if (!token) {
    // Verificar si es una ruta protegida
    const isAdminRoute = PROTECTED_ROUTES.admin.some(route => pathname.startsWith(route));
    const isDriverRoute = PROTECTED_ROUTES.driver.some(route => pathname.startsWith(route));

    if (isAdminRoute || isDriverRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Si no es ruta protegida, continuar
    return NextResponse.next();
  }

  try {
    // Decodificar token
    const decodedToken = jwt.jwtDecode(token);
    const userRole = decodedToken.role;

    // Verificar permisos por rol
    if (pathname.startsWith('/(admin)') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (pathname.startsWith('/driver') && userRole !== 'driver') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Usuario autenticado con los permisos correctos, continuar
    return NextResponse.next();
  } catch (error) {
    console.error('Error verificando token:', error);

    // Error de verificación, redirigir al login
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// Solo verificar rutas específicas
export const config = {
  matcher: [
    '/(admin)/:path*',
    '/driver',
    '/(tabs)/profile',
  ],
};