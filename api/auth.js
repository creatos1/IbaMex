
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { authenticateJWT } = require('../middleware/auth');
const { generateMfaSecret, verifyMfaToken } = require('../services/authService');

// Middleware para obtener el modelo de usuario
const getUserModel = (req, res, next) => {
  if (!req.app.locals.sql) {
    return res.status(500).json({ message: 'Database connection not available' });
  }
  req.userModel = new UserModel(req.app.locals.sql);
  next();
};

// Registro de usuario
router.post('/register', getUserModel, async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    // Validar datos
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await req.userModel.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }
    
    // Verificar si el email ya existe
    const existingEmail = await req.userModel.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
    }
    
    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear el usuario
    const userId = await req.userModel.create({
      username,
      email,
      password: hashedPassword,
      fullName: fullName || username,
      role: 'user',
      mfaEnabled: false,
      active: true
    });
    
    return res.status(201).json({ message: 'Usuario registrado con éxito', userId });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Inicio de sesión
router.post('/login', getUserModel, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validar datos
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }
    
    // Prevenir timing attacks usando tiempo constante para verificar
    // independientemente de si el usuario existe o no
    const user = await req.userModel.findByUsername(username);
    
    // Variable para registrar evento de seguridad
    const loginAttempt = {
      username,
      timestamp: new Date(),
      success: false,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    };
    
    // Para prevenir ataques de reconocimiento de usuario,
    // siempre retornamos el mismo mensaje de error
    if (!user || !user.active) {
      console.log('Intento de inicio de sesión fallido:', loginAttempt);
      // Usar un tiempo constante para evitar timing attacks
      await bcrypt.compare(password, '$2b$10$invalidhashfortimingattacks');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Contraseña incorrecta:', loginAttempt);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Actualizar registro de evento de seguridad
    loginAttempt.success = true;
    console.log('Inicio de sesión exitoso:', loginAttempt);
    
    // Si el usuario tiene MFA activado, devolver un token temporal y requerir verificación MFA
    if (user.mfaEnabled) {
      const tempToken = jwt.sign(
        { id: user.id, username: user.username, requireMfa: true },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '5m' }
      );
      
      return res.json({ 
        message: 'MFA requerido',
        requireMfa: true,
        tempToken,
        userId: user.id
      });
    }
    
    // Generar JWT para el usuario autenticado sin MFA
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Enviar respuesta exitosa
    return res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Verificación de MFA
router.post('/verify-mfa', getUserModel, async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    
    if (!tempToken || !code) {
      return res.status(400).json({ message: 'Token temporal y código son requeridos' });
    }
    
    // Verificar token temporal
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
    
    // Verificar que el token sea para MFA
    if (!decoded.requireMfa) {
      return res.status(400).json({ message: 'Token no válido para verificación MFA' });
    }
    
    // Buscar usuario
    const user = await req.userModel.findById(decoded.id);
    if (!user || !user.mfaSecret) {
      return res.status(401).json({ message: 'Usuario no encontrado o MFA no configurado' });
    }
    
    // Verificar código MFA
    const isValid = verifyMfaToken(user.mfaSecret, code);
    if (!isValid) {
      return res.status(401).json({ message: 'Código MFA inválido' });
    }
    
    // Generar token JWT completo
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Enviar respuesta exitosa
    return res.json({
      message: 'Verificación MFA exitosa',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (error) {
    console.error('Error en verificación MFA:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Configurar MFA
router.post('/setup-mfa', [authenticateJWT, getUserModel], async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Generar secreto MFA
    const { secret, qrCodeUrl } = generateMfaSecret(req.user.username);
    
    // Guardar secreto en la base de datos (pero no activar MFA aún)
    await req.userModel.toggleMfa(userId, false, secret);
    
    return res.json({
      message: 'Configuración MFA iniciada',
      secret,
      qrCodeUrl
    });
  } catch (error) {
    console.error('Error en setup MFA:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Activar/desactivar MFA
router.post('/toggle-mfa', [authenticateJWT, getUserModel], async (req, res) => {
  try {
    const { enable, code } = req.body;
    const userId = req.user.id;
    
    // Buscar usuario
    const user = await req.userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Si está activando MFA, verificar el código
    if (enable) {
      if (!code) {
        return res.status(400).json({ message: 'Código MFA requerido' });
      }
      
      // Verificar que el usuario tenga un secreto MFA guardado
      if (!user.mfaSecret) {
        return res.status(400).json({ message: 'Primero debe configurar MFA' });
      }
      
      // Verificar código MFA
      const isValid = verifyMfaToken(user.mfaSecret, code);
      if (!isValid) {
        return res.status(401).json({ message: 'Código MFA inválido' });
      }
      
      // Activar MFA
      await req.userModel.toggleMfa(userId, true, user.mfaSecret);
    } else {
      // Desactivar MFA
      await req.userModel.toggleMfa(userId, false, null);
    }
    
    return res.json({
      message: enable ? 'MFA activado con éxito' : 'MFA desactivado con éxito',
      mfaEnabled: enable
    });
  } catch (error) {
    console.error('Error al cambiar estado MFA:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Cambiar contraseña
router.put('/change-password', [authenticateJWT, getUserModel], async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Contraseña actual y nueva son requeridas' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }
    
    // Buscar usuario
    const user = await req.userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }
    
    // Hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Actualizar contraseña
    await req.userModel.update(userId, { password: hashedPassword });
    
    return res.json({ message: 'Contraseña actualizada con éxito' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Obtener perfil del usuario
router.get('/profile', [authenticateJWT, getUserModel], async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar usuario
    const user = await req.userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Eliminar campos sensibles
    const { password, mfaSecret, ...userData } = user;
    
    return res.json(userData);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Actualizar perfil
router.put('/profile', [authenticateJWT, getUserModel], async (req, res) => {
  try {
    const { fullName } = req.body;
    const userId = req.user.id;
    
    // Buscar usuario
    const user = await req.userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Actualizar datos
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No hay datos para actualizar' });
    }
    
    await req.userModel.update(userId, updateData);
    
    return res.json({ message: 'Perfil actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Obtener listado de usuarios (solo admin)
router.get('/users', [authenticateJWT, getUserModel], async (req, res) => {
  try {
    // Verificar que el usuario sea admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const { role, active, search } = req.query;
    
    // Construir filtro
    const filter = {};
    if (role) filter.role = role;
    if (active !== undefined) filter.active = active === 'true';
    if (search) filter.searchTerm = search;
    
    // Obtener usuarios
    const users = await req.userModel.findAll(filter);
    
    // Eliminar campos sensibles
    const sanitizedUsers = users.map(user => {
      const { password, mfaSecret, ...userData } = user;
      return userData;
    });
    
    return res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

module.exports = router;
