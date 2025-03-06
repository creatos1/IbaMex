
// Middleware para verificar la autenticación y los roles en el servidor
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Define las rutas que requieren autenticación
const protectedPaths = [
  // Rutas de administración
  '/api/admin',
  '/api/user/all',
  '/api/analytics',
  
  // Rutas de usuario
  '/api/profile',
  '/api/user',
];

// Define los roles requeridos para ciertas rutas
const roleRequirements = {
  '/api/admin': ['admin'],
  '/api/user/all': ['admin'],
  '/api/analytics': ['admin'],
};

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Verificar si la ruta está protegida
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath) {
    // Obtener token de la cabecera Authorization
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Verificar y decodificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Verificar roles si es necesario
      const requiredRoles = roleRequirements[pathname];
      
      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        return NextResponse.json(
          { error: 'Acceso denegado' },
          { status: 403 }
        );
      }
      
      // Continuar con la solicitud
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }
  }
  
  // Si no es una ruta protegida, continuar
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
