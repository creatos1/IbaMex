
const jwt = require('jsonwebtoken');

// Middleware para autenticar token JWT
const authenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No autorizado. Token no proporcionado' });
    }
    
    // Verificar formato del encabezado
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar que exista un token
    if (!token || token.trim() === '') {
      return res.status(401).json({ message: 'Token vacío' });
    }
    
    // Registrar intento de autenticación para auditoría
    const authAttempt = {
      timestamp: new Date(),
      ip: req.ip || 'unknown',
      path: req.path,
      method: req.method,
      userAgent: req.headers['user-agent'] || 'unknown',
    };
    
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        // Registro detallado del error para depuración
        console.log('JWT Error:', { 
          ...authAttempt, 
          error: err.name, 
          message: err.message 
        });
        
        // Respuesta genérica para evitar fugas de información
        return res.status(403).json({ message: 'Token inválido o expirado' });
      }
      
      // Verificar si el token es para verificación MFA
      if (user.requireMfa) {
        return res.status(403).json({ message: 'Se requiere verificación MFA', requireMfa: true });
      }
      
      // Registrar autenticación exitosa para auditoría
      console.log('Auth Success:', { ...authAttempt, userId: user.id, username: user.username });
      
      // Añadir información de autenticación a la solicitud
      req.user = user;
      req.authInfo = {
        issuedAt: new Date(user.iat * 1000),
        expiresAt: new Date(user.exp * 1000),
      };
      
      next();
    });
  } catch (error) {
    console.error('Error en autenticación JWT:', error);
    // Mensaje genérico para evitar fugas de información
    return res.status(500).json({ message: 'Error de servidor en autenticación' });
  }
};

// Middleware para verificar rol de administrador
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador' });
  }
};

// Middleware para verificar rol de administrador o conductor
const isAdminOrDriver = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'driver')) {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador o conductor' });
  }
};

// Middleware para verificar rol de conductor
const isDriver = (req, res, next) => {
  if (req.user && req.user.role === 'driver') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de conductor' });
  }
};

module.exports = {
  authenticateJWT,
  isAdmin,
  isAdminOrDriver,
  isDriver
};
