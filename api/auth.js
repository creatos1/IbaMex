const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const UserModel = require('../models/userModel');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'ibamex-secret-key';

// Middleware para validar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Middleware para verificar rol de admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Require Admin Role!' });
  }
  next();
};

// Registro de usuario
router.post('/register', [
  check('username', 'El nombre de usuario es requerido').not().isEmpty(),
  check('email', 'Proporcione un email válido').isEmail(),
  check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const userExists = await UserModel.findByEmail(email) || await UserModel.findByUsername(username);

    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Generar salt y hash para la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    await UserModel.create({
      username,
      email,
      password: hashedPassword,
      role: 'user', // Por defecto todos son usuarios normales
      mfaEnabled: false,
      status: 'active'
    });

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error('Error en el registro de usuario:', err);
    res.status(500).json({ 
      message: 'Error en el servidor', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Verificar si el usuario tiene MFA habilitado
    if (user.mfaEnabled) {
      // Generar un token temporal para MFA
      const tempToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '5m' });

      // Aquí implementaríamos el envío de código por email o SMS
      // Por ahora usamos un código fijo para demostración (123456)

      return res.json({ 
        requireMfa: true,
        tempToken,
        message: 'Se requiere verificación MFA'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Enviar respuesta
    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Verificación de MFA
router.post('/verify-mfa', async (req, res) => {
  const { code } = req.body;
  const authHeader = req.headers['authorization'];
  const tempToken = authHeader && authHeader.split(' ')[1];

  if (!tempToken) {
    return res.status(401).json({ message: 'No se proporcionó token' });
  }

  try {
    // Verificar el token temporal
    const decoded = jwt.verify(tempToken, JWT_SECRET);

    // Buscar el usuario
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Verificar el código MFA (en un caso real, verificaríamos contra un código generado)
    if (code !== '123456') { // Código de ejemplo
      return res.status(400).json({ message: 'Código MFA inválido' });
    }

    // Generar token JWT completo
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Enviar respuesta
    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (err) {
    console.error(err);

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Cambiar contraseña
router.put('/user/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.userId;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    // Buscar usuario
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar contraseña antigua
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }

    // Validar nueva contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'La nueva contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Generar hash de nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar contraseña
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Actualizar perfil de usuario
router.put('/user/profile', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const userData = req.body;

  // Asegurarse que no se actualicen campos sensibles
  delete userData.password;
  delete userData.role; // El rol solo debe cambiarse por un admin

  try {
    // Buscar usuario
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar datos
    Object.assign(user, userData); // Use Object.assign for safer merging
    await user.save();

    res.json({
      message: 'Perfil actualizado correctamente',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Activar/desactivar MFA
router.put('/user/toggle-mfa', authenticateToken, async (req, res) => {
  const { enable } = req.body;
  const userId = req.user.userId;

  if (enable === undefined) {
    return res.status(400).json({ message: 'Se requiere el campo enable' });
  }

  try {
    // Buscar usuario
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar estado MFA
    user.mfaEnabled = enable;
    await user.save();

    // En un caso real, aquí generaríamos un código QR para configurar la app
    // o configurar el envío de códigos por email/SMS

    res.json({
      success: true,
      message: enable ? 'MFA activado correctamente' : 'MFA desactivado correctamente',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener usuarios (solo para admin)
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await UserModel.find({}, {password: 0}); //Exclude password field
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Cambiar rol de usuario (solo para admin)
router.put('/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  if (!role || !['admin', 'driver', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Rol inválido' });
  }

  try {
    // Buscar usuario
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar rol
    user.role = role;
    await user.save();

    res.json({
      message: 'Rol actualizado correctamente',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Cambiar estado de usuario (solo para admin)
router.put('/users/:id/status', authenticateToken, isAdmin, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!status || !['active', 'inactive', 'blocked'].includes(status)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  try {
    // Buscar usuario
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar estado
    user.status = status;
    await user.save();

    res.json({
      message: 'Estado actualizado correctamente',
      user: {
        id: user._id,
        username: user.username,
        status: user.status
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;