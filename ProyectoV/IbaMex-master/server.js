
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Redis = require('ioredis');

// Configuración de Express
const app = express();
app.use(cors());
app.use(express.json());

// Crear servidor HTTP y Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // En producción, limitar a tu dominio
    methods: ['GET', 'POST']
  }
});

// Configuración de Redis para caché
const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
});

// Configuración de MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transport-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conexión a MongoDB establecida');
}).catch(err => {
  console.error('Error conectando a MongoDB:', err);
});

// Definir esquemas de MongoDB
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['driver', 'passenger'], default: 'passenger' },
  createdAt: { type: Date, default: Date.now }
});

const routeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  stops: [String],
  active: { type: Boolean, default: true }
});

const busSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registrationNumber: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' }
});

const occupancyLogSchema = new mongoose.Schema({
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  timestamp: { type: Date, default: Date.now },
  occupancy: { type: Number, required: true },
  stopName: { type: String }
});

// Crear modelos
const User = mongoose.model('User', userSchema);
const Route = mongoose.model('Route', routeSchema);
const Bus = mongoose.model('Bus', busSchema);
const OccupancyLog = mongoose.model('OccupancyLog', occupancyLogSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // En producción, usar variable de entorno

// Middleware para verificar JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Rutas API
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // En producción, usar hashing para contraseñas
    const user = await User.findOne({ username, password });
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Rutas protegidas con JWT
app.get('/api/routes', authenticateJWT, async (req, res) => {
  try {
    const routes = await Route.find({ active: true });
    res.json(routes);
  } catch (error) {
    console.error('Error obteniendo rutas:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.get('/api/buses', authenticateJWT, async (req, res) => {
  try {
    const { routeId } = req.query;
    let query = {};
    
    if (routeId) {
      query.routeId = routeId;
    }
    
    const buses = await Bus.find(query).populate('routeId');
    
    // Formatear la respuesta
    const formattedBuses = buses.map(bus => ({
      id: bus._id,
      routeId: bus.routeId._id,
      routeName: bus.routeId.name,
      registrationNumber: bus.registrationNumber,
      occupancyPercentage: Math.round((bus.currentOccupancy / bus.capacity) * 100),
      location: bus.location,
      status: bus.status
    }));
    
    res.json(formattedBuses);
  } catch (error) {
    console.error('Error obteniendo buses:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta para actualizar la ocupación (desde Arduino)
app.post('/api/occupancy/update', async (req, res) => {
  try {
    const { busId, sensorData } = req.body;
    
    // Suponiendo que sensorData tiene entrada y salida
    const { enter, exit } = sensorData;
    
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: 'Bus no encontrado' });
    }
    
    // Actualizar ocupación
    bus.currentOccupancy = Math.max(0, bus.currentOccupancy + enter - exit);
    await bus.save();
    
    // Registrar log
    await OccupancyLog.create({
      busId: bus._id,
      occupancy: bus.currentOccupancy,
      // Otros datos relevantes
    });
    
    // Emitir actualización a través de Socket.IO
    io.emit('occupancy-update', {
      busId: bus._id,
      occupancyPercentage: Math.round((bus.currentOccupancy / bus.capacity) * 100)
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando ocupación:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Socket.IO para comunicación en tiempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  // Para conductores: actualizar ubicación del bus
  socket.on('update-location', async (data) => {
    try {
      const { busId, location, token } = data;
      
      // Verificar token
      jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
          return socket.emit('error', { message: 'Token inválido' });
        }
        
        // Solo conductores pueden actualizar
        if (decoded.role !== 'driver') {
          return socket.emit('error', { message: 'No autorizado' });
        }
        
        // Actualizar ubicación
        await Bus.findByIdAndUpdate(busId, { location });
        
        // Actualizar caché en Redis
        await redisClient.set(`bus:${busId}:location`, JSON.stringify(location));
        
        // Emitir a todos los clientes
        io.emit('bus-location-update', { busId, location });
      });
    } catch (error) {
      console.error('Error actualizando ubicación:', error);
      socket.emit('error', { message: 'Error del servidor' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
