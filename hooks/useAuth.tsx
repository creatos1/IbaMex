import { createContext, useState, useContext, useEffect, ReactNode, FC } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { jwtDecode } from "jwt-decode";

// Tipos
interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'driver';
  mfaEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  requireMfa: boolean;
  tempToken: string | null;
  signUp: (username: string, email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  verifyMfa: (code: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  toggleMfa: (enable: boolean) => Promise<boolean>;
}

// API URL
const API_URL = Platform.OS === 'web' 
  ? window.location.origin + '/api' 
  : __DEV__ 
    ? 'http://0.0.0.0:3000/api' // Para emulador Android
    : 'https://' + (process.env.REPL_SLUG || 'ibamex') + '.' + (process.env.REPL_OWNER || 'repl') + '.repl.co/api';

// Crear el contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [requireMfa, setRequireMfa] = useState<boolean>(false);
  const [tempToken, setTempToken] = useState<string | null>(null);

  // Verificar token almacenado al iniciar
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');

        if (storedToken) {
          try {
            // Validar y decodificar el token
            const decoded = jwtDecode<any>(storedToken);
            const currentTime = Date.now() / 1000;

            if (decoded.exp && decoded.exp < currentTime) {
              // Token expirado
              console.log('Token expirado, cerrando sesión');
              await AsyncStorage.removeItem('auth_token');
              setToken(null);
              setUser(null);
            } else {
              // Token válido
              setToken(storedToken);
              setUser({
                id: decoded.userId,
                username: decoded.username,
                email: decoded.email,
                role: decoded.role
              });
            }
          } catch (err) {
            console.error('Error al decodificar token:', err);
            await AsyncStorage.removeItem('auth_token');
          }
        }
      } catch (err) {
        console.error('Error al cargar token:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  // Registro de usuario
  const signUp = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Intentando registrar usuario en: ${API_URL}/register`);

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password }),
      });

      console.log(`Respuesta recibida, status: ${response.status}`);

      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors[0].msg || 'Error de registro');
        }
        throw new Error(data.message || 'Error de registro');
      }

      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error('Error durante el registro:', err);
      setError(err.message || 'Error durante el registro');
      setIsLoading(false);
      return false;
    }
  };

  // Inicio de sesión
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setRequireMfa(false);
    setTempToken(null);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error de inicio de sesión');
      }

      // Verificar si se requiere MFA
      if (data.requireMfa) {
        setRequireMfa(true);
        setTempToken(data.tempToken);
        setIsLoading(false);
        return true;
      }

      // Guardar token y datos de usuario
      await AsyncStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error durante el inicio de sesión');
      setIsLoading(false);
      return false;
    }
  };

  // Verificación de MFA
  const verifyMfa = async (code: string): Promise<boolean> => {
    if (!tempToken) {
      setError('No hay token temporal disponible');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/verify-mfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error de verificación MFA');
      }

      // Guardar token y datos de usuario
      await AsyncStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setRequireMfa(false);
      setTempToken(null);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error durante la verificación MFA');
      setIsLoading(false);
      return false;
    }
  };

  // Cerrar sesión
  const signOut = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (err) {
      console.error('Error al eliminar token:', err);
    } finally {
      setToken(null);
      setUser(null);
      setRequireMfa(false);
      setTempToken(null);
    }
  };

  // Actualizar perfil
  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!token) {
      setError('No hay sesión activa');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar perfil');
      }

      // Actualizar datos de usuario
      setUser(prev => prev ? { ...prev, ...data.user } : data.user);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error durante la actualización del perfil');
      setIsLoading(false);
      return false;
    }
  };

  // Cambiar contraseña
  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!token) {
      setError('No hay sesión activa');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar contraseña');
      }

      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error durante el cambio de contraseña');
      setIsLoading(false);
      return false;
    }
  };

  // Activar/desactivar MFA
  const toggleMfa = async (enable: boolean): Promise<boolean> => {
    if (!token) {
      setError('No hay sesión activa');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/user/toggle-mfa`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enable }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar configuración MFA');
      }

      // Actualizar estado MFA del usuario
      setUser(prev => prev ? { ...prev, mfaEnabled: enable } : null);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error durante la configuración de MFA');
      setIsLoading(false);
      return false;
    }
  };

  const authContext: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    requireMfa,
    tempToken,
    signUp,
    signIn,
    verifyMfa,
    signOut,
    updateProfile,
    changePassword,
    toggleMfa
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
};

export default useAuth;