
const jwt = require('jsonwebtoken');

// Middleware para autenticar token JWT
const authenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No autorizado. Token no proporcionado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
      }
      
      // Verificar si el token es para verificación MFA
      if (user.requireMfa) {
        return res.status(403).json({ message: 'Se requiere verificación MFA', requireMfa: true });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error en autenticación JWT:', error);
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
