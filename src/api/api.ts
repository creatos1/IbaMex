
// Configuración básica para las llamadas a la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Interfaz para respuesta de login
interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: 'driver' | 'passenger';
  };
}

// Interfaz para bus
export interface Bus {
  id: string;
  routeId: string;
  routeName: string;
  registrationNumber: string;
  occupancyPercentage: number;
  location: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  nextStop?: string;
}

// Interfaz para ruta
export interface Route {
  id: string;
  name: string;
  description: string;
  stops: string[];
  active: boolean;
}

// Función para manejar errores
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  throw error;
};

// Función para realizar peticiones
const fetchApi = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Función para realizar peticiones autenticadas
const fetchAuthApi = async (endpoint: string, token: string, options: RequestInit = {}): Promise<any> => {
  return fetchApi(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
};

// API de autenticación
export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    return fetchApi('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }
};

// API para rutas
export const routesApi = {
  getRoutes: async (token: string): Promise<Route[]> => {
    return fetchAuthApi('/routes', token);
  }
};

// API para buses
export const busesApi = {
  getBuses: async (token: string, routeId?: string): Promise<Bus[]> => {
    const url = routeId ? `/buses?routeId=${routeId}` : '/buses';
    return fetchAuthApi(url, token);
  }
};

export default {
  auth: authApi,
  routes: routesApi,
  buses: busesApi
};
