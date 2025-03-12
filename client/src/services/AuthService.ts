import AsyncStorage from '@react-native-async-storage/async-storage';

// Definimos la URL base de la API
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Interfaces para tipado
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  mfaEnabled: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  requireMfa?: boolean;
  tempToken?: string;
}

// Clase para manejar la autenticación
class AuthService {
  // Método para iniciar sesión
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Si no requiere MFA, guardar token
      if (!data.requireMfa) {
        await this.setToken(data.token);
      }

      return data;
    } catch (error: any) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Método para verificar MFA
  async verifyMfa(tempToken: string, code: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/verify-mfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tempToken, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar MFA');
      }

      // Guardar token
      await this.setToken(data.token);
      return data;
    } catch (error: any) {
      console.error('Error en verificación MFA:', error);
      throw error;
    }
  }

  // Método para registro
  async register(userData: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }): Promise<{ userId: number; message: string }> {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      return data;
    } catch (error: any) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  // Método para cerrar sesión
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  // Método para obtener token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }

  // Método para guardar token
  private async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error al guardar token:', error);
    }
  }

  // Método para verificar si está autenticado
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  // Método para obtener usuario actual
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;

      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.logout();
          return null;
        }
        throw new Error('Error al obtener perfil de usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }
}

export default new AuthService();