
import { io, Socket } from 'socket.io-client';

// Configuración de Socket.IO
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

// Inicializar Socket
export const initSocket = (token: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Manejo de eventos básicos
    socket.on('connect', () => {
      console.log('Conectado a Socket.IO:', socket?.id);
    });

    socket.on('connect_error', (error) => {
      console.error('Error de conexión Socket.IO:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Desconectado de Socket.IO:', reason);
    });
  }

  return socket;
};

// Cerrar conexión
export const closeSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Suscribirse a actualizaciones de ubicación de autobuses
export const subscribeToLocationUpdates = (callback: (data: any) => void): void => {
  if (socket) {
    socket.on('bus-location-update', callback);
  } else {
    console.error('Socket no inicializado');
  }
};

// Suscribirse a actualizaciones de ocupación
export const subscribeToOccupancyUpdates = (callback: (data: any) => void): void => {
  if (socket) {
    socket.on('occupancy-update', callback);
  } else {
    console.error('Socket no inicializado');
  }
};

// Función para actualizar la ubicación (para conductores)
export const updateBusLocation = (busId: string, location: { lat: number, lng: number }, token: string): void => {
  if (socket) {
    socket.emit('update-location', { busId, location, token });
  } else {
    console.error('Socket no inicializado');
  }
};

export default {
  initSocket,
  closeSocket,
  subscribeToLocationUpdates,
  subscribeToOccupancyUpdates,
  updateBusLocation
};
