
# Sistema de Autenticación IbaMex

Este documento proporciona información sobre el sistema de autenticación implementado en la aplicación IbaMex.

## Características implementadas

1. **Registro de usuarios**
   - Formulario de registro con validación
   - Almacenamiento seguro de datos

2. **Inicio de sesión**
   - Validación de credenciales
   - Generación de tokens JWT
   - Manejo seguro de sesiones

3. **Autenticación en dos pasos (MFA)**
   - Opción para activar/desactivar MFA
   - Verificación por código enviado por correo

4. **Panel de configuración de usuario**
   - Cambio de contraseña
   - Actualización de información personal
   - Gestión de MFA

5. **Control de acceso basado en roles**
   - Roles predefinidos: admin, driver, user
   - Protección de rutas según rol

6. **Panel de administración de usuarios**
   - Visualización de usuarios
   - Cambio de rol y estado de usuarios
   - Filtrado y búsqueda

## Estructura del código

- `/hooks/useAuth.ts`: Hook principal para manejar la autenticación
- `/components/auth/`: Componentes relacionados con la autenticación
- `/app/(admin)/`: Rutas protegidas para administradores

## Configuración del backend

Para completar la implementación, se debe configurar un backend con las siguientes API endpoints:

- POST `/api/register`: Registro de usuarios
- POST `/api/login`: Inicio de sesión
- POST `/api/verify-mfa`: Verificación de código MFA
- PUT `/api/user/profile`: Actualización de perfil
- PUT `/api/user/change-password`: Cambio de contraseña
- PUT `/api/user/toggle-mfa`: Activación/desactivación de MFA
- GET `/api/users`: Obtener listado de usuarios (solo admin)

## Consideraciones de seguridad

- Las contraseñas se deben almacenar con hash (bcrypt recomendado)
- Los tokens JWT deben tener una duración limitada
- Utilizar HTTPS para todas las comunicaciones
- Proteger contra ataques CSRF y XSS
- Implementar rate limiting para prevenir ataques de fuerza bruta
