
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definimos la URL base de la API
const API_URL = 'http://localhost:3000/api';

// Tipos para los formularios
interface LoginForm {
  username: string;
  password: string;
}

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

// Tipo para props
interface AuthScreenProps {
  onAuthSuccess: (token: string, user: any) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  // Estado para controlar qué formulario mostrar
  const [isLogin, setIsLogin] = useState(true);
  
  // Estados para los formularios
  const [loginForm, setLoginForm] = useState<LoginForm>({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  
  // Estados para MFA si es necesario
  const [requireMfa, setRequireMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  
  // Estado para carga
  const [loading, setLoading] = useState(false);

  // Función para validar email
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Función para validar formulario de registro
  const validateRegisterForm = (): boolean => {
    if (!registerForm.username || registerForm.username.length < 3) {
      Alert.alert('Error', 'El nombre de usuario debe tener al menos 3 caracteres');
      return false;
    }
    
    if (!validateEmail(registerForm.email)) {
      Alert.alert('Error', 'Introduzca un email válido');
      return false;
    }
    
    if (registerForm.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }
    
    return true;
  };
  
  // Función para manejar login
  const handleLogin = async () => {
    try {
      setLoading(true);
      
      // Validación básica
      if (!loginForm.username || !loginForm.password) {
        Alert.alert('Error', 'Usuario y contraseña son requeridos');
        setLoading(false);
        return;
      }
      
      // Llamada a la API para login
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }
      
      // Verificar si se requiere MFA
      if (data.requireMfa) {
        setRequireMfa(true);
        setTempToken(data.tempToken);
        setLoading(false);
        return;
      }
      
      // Guardar token y datos de usuario
      await AsyncStorage.setItem('auth_token', data.token);
      
      // Notificar al componente padre que la autenticación fue exitosa
      onAuthSuccess(data.token, data.user);
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error durante el inicio de sesión');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para verificar MFA
  const handleVerifyMfa = async () => {
    try {
      setLoading(true);
      
      if (!mfaCode || mfaCode.length !== 6) {
        Alert.alert('Error', 'Introduzca un código válido');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/verify-mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken,
          code: mfaCode
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar MFA');
      }
      
      // Guardar token y datos de usuario
      await AsyncStorage.setItem('auth_token', data.token);
      
      // Notificar al componente padre que la autenticación fue exitosa
      onAuthSuccess(data.token, data.user);
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Código inválido o expirado');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para manejar registro
  const handleRegister = async () => {
    try {
      if (!validateRegisterForm()) return;
      
      setLoading(true);
      
      // Llamada a la API para registro
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          fullName: registerForm.fullName
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }
      
      // Mostrar mensaje de éxito y cambiar a pantalla de login
      Alert.alert('Registro exitoso', 'Ahora puede iniciar sesión con sus credenciales', [
        { text: 'OK', onPress: () => setIsLogin(true) }
      ]);
      
      // Limpiar formulario
      setRegisterForm({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
      });
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error durante el registro');
    } finally {
      setLoading(false);
    }
  };
  
  // Renderizar formulario de MFA
  if (requireMfa) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.title}>Verificación en dos pasos</Text>
          <Text style={styles.subtitle}>Ingrese el código de verificación</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Código de 6 dígitos"
            keyboardType="number-pad"
            maxLength={6}
            value={mfaCode}
            onChangeText={setMfaCode}
          />
          
          {loading ? (
            <ActivityIndicator size="large" color="#0097FB" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleVerifyMfa}>
              <Text style={styles.buttonText}>Verificar</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.appTitle}>IbaMex Transit</Text>
        
        <View style={styles.form}>
          <Text style={styles.title}>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</Text>
          
          {isLogin ? (
            // Formulario de login
            <>
              <TextInput
                style={styles.input}
                placeholder="Nombre de usuario"
                value={loginForm.username}
                onChangeText={(text) => setLoginForm({...loginForm, username: text})}
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry
                value={loginForm.password}
                onChangeText={(text) => setLoginForm({...loginForm, password: text})}
              />
              
              {loading ? (
                <ActivityIndicator size="large" color="#0097FB" />
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            // Formulario de registro
            <>
              <TextInput
                style={styles.input}
                placeholder="Nombre de usuario"
                value={registerForm.username}
                onChangeText={(text) => setRegisterForm({...registerForm, username: text})}
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                keyboardType="email-address"
                value={registerForm.email}
                onChangeText={(text) => setRegisterForm({...registerForm, email: text})}
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                value={registerForm.fullName}
                onChangeText={(text) => setRegisterForm({...registerForm, fullName: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry
                value={registerForm.password}
                onChangeText={(text) => setRegisterForm({...registerForm, password: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                secureTextEntry
                value={registerForm.confirmPassword}
                onChangeText={(text) => setRegisterForm({...registerForm, confirmPassword: text})}
              />
              
              {loading ? (
                <ActivityIndicator size="large" color="#0097FB" />
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                  <Text style={styles.buttonText}>Registrarse</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          
          <TouchableOpacity 
            style={styles.switchButton} 
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchButtonText}>
              {isLogin 
                ? '¿No tienes cuenta? Regístrate' 
                : '¿Ya tienes cuenta? Inicia sesión'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0097FB',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0097FB',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
  },
  switchButtonText: {
    color: '#0097FB',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default AuthScreen;
