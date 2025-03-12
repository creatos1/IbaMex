
import { useState, useEffect, useCallback } from 'react';
import AuthService, { User } from '../services/AuthService';

interface UseAuthResult {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ requireMfa: boolean, tempToken?: string }>;
  verifyMfa: (tempToken: string, code: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }) => Promise<{ userId: number; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const useAuth = (): UseAuthResult => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Función para cargar el usuario autenticado
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const isAuth = await AuthService.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar usuario al montar el componente
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Función de inicio de sesión
  const login = async (username: string, password: string) => {
    try {
      const response = await AuthService.login(username, password);
      
      if (response.requireMfa) {
        return { 
          requireMfa: true, 
          tempToken: response.tempToken 
        };
      }

      setIsAuthenticated(true);
      setUser(response.user);
      return { requireMfa: false };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  // Función para verificar MFA
  const verifyMfa = async (tempToken: string, code: string) => {
    try {
      const response = await AuthService.verifyMfa(tempToken, code);
      setIsAuthenticated(true);
      setUser(response.user);
    } catch (error) {
      console.error('Error en verificación MFA:', error);
      throw error;
    }
  };

  // Función de registro
  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }) => {
    return await AuthService.register(userData);
  };

  // Función de cierre de sesión
  const logout = async () => {
    await AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Función para refrescar datos del usuario
  const refreshUser = async () => {
    await loadUser();
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    verifyMfa,
    register,
    logout,
    refreshUser,
  };
};

export default useAuth;
