
import React, { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { jwtDecode } from 'jwt-decode';
// Definición de tipos
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'driver' | 'user';
  name?: string;
  mfaEnabled?: boolean;
}

interface DecodedToken {
  userId: string;
  username: string;
  email: string;
  role: 'admin' | 'driver' | 'user';
  exp: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  needsMfa: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyMfa: (code: string) => Promise<boolean>;
  updateUserProfile: (userData: Partial<User>) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  toggleMfa: (enable: boolean) => Promise<boolean>;
}

// API URL
const API_URL = '/api';

// Crear el contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Store token securely
const storeToken = async (token: string) => {
  if (Platform.OS !== 'web') {
    // Usar SecureStore para móviles
    await SecureStore.setItemAsync('userToken', token);
  } else {
    // Usar localStorage para web
    localStorage.setItem('userToken', token);
  }
};

// Get token
const getToken = async (): Promise<string | null> => {
  if (Platform.OS !== 'web') {
    return await SecureStore.getItemAsync('userToken');
  } else {
    return localStorage.getItem('userToken');
  }
};

// Remove token
const removeToken = async () => {
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync('userToken');
  } else {
    localStorage.removeItem('userToken');
  }
};

// Proveedor de autenticación
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsMfa, setNeedsMfa] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);

  // Verificar el token al cargar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await getToken();
        
        if (token) {
          // Decodificar el token para obtener la información del usuario
          const decoded = jwtDecode<DecodedToken>(token);
          
          // Verificar si el token ha expirado
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            await removeToken();
            return;
          }
          
          // Establecer el usuario
          setUser({
            id: decoded.userId,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role
          });
        }
      } catch (err) {
        console.error("Error loading user:", err);
        await removeToken();
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Función de login
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error de autenticación');
      }
      
      if (data.requireMfa) {
        // Si se requiere MFA, guardar el token temporal y activar el estado de MFA
        setTempToken(data.tempToken);
        setNeedsMfa(true);
        setIsLoading(false);
        return false;
      } else {
        // Si no se requiere MFA, guardar el token y establecer el usuario
        await storeToken(data.token);
        setUser(data.user);
        setIsLoading(false);
        return true;
      }
    } catch (err: any) {
      setError(err.message || 'Error durante el inicio de sesión');
      setIsLoading(false);
      return false;
    }
  };

  // Función de registro
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error de registro');
      }
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error durante el registro');
      setIsLoading(false);
      return false;
    }
  };

  // Verificar código MFA
  const verifyMfa = async (code: string): Promise<boolean> => {
    if (!tempToken) {
      setError('No hay sesión de MFA activa');
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
        throw new Error(data.message || 'Código MFA inválido');
      }
      
      // Guardar el token y establecer el usuario
      await storeToken(data.token);
      setUser(data.user);
      
      // Limpiar estados temporales
      setTempToken(null);
      setNeedsMfa(false);
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error durante la verificación MFA');
      setIsLoading(false);
      return false;
    }
  };

  // Actualizar perfil del usuario
  const updateUserProfile = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('No estás autenticado');
      }
      
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
      
      // Actualizar el usuario local
      setUser(prev => prev ? { ...prev, ...userData } : null);
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
      setIsLoading(false);
      return false;
    }
  };

  // Cambiar contraseña
  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('No estás autenticado');
      }
      
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
      setError(err.message || 'Error al cambiar la contraseña');
      setIsLoading(false);
      return false;
    }
  };

  // Activar/desactivar MFA
  const toggleMfa = async (enable: boolean): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('No estás autenticado');
      }
      
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
        throw new Error(data.message || 'Error al configurar MFA');
      }
      
      // Si la activación fue exitosa, actualizar el estado del usuario
      if (data.success) {
        setUser(prev => prev ? { ...prev, mfaEnabled: enable } : null);
      }
      
      setIsLoading(false);
      return data.success;
    } catch (err: any) {
      setError(err.message || 'Error al configurar MFA');
      setIsLoading(false);
      return false;
    }
  };

  // Función de logout
  const logout = async (): Promise<void> => {
    await removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      error,
      needsMfa,
      login,
      register,
      logout,
      verifyMfa,
      updateUserProfile,
      changePassword,
      toggleMfa
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar la autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};
