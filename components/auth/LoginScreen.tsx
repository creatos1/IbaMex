
import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, user, isLoading, error } = useAuth();
  
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');
  const inputBackground = useThemeColor({ light: '#f0f0f0', dark: '#2a2a2a' }, 'background');
  const textColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');

  // Redireccionar si el usuario ya está autenticado
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else if (user.role === 'driver') {
        router.replace('/driver');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [user, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña');
      return;
    }
    
    const success = await login(email, password);
    
    if (success) {
      // La redirección se maneja en el useEffect
    }
  };

  if (isLoading && user) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={styles.loadingText}>Iniciando sesión...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Puedes agregar un logo aquí */}
        <ThemedText style={styles.title}>IbaMex</ThemedText>
        <ThemedText style={styles.subtitle}>Inicia sesión para continuar</ThemedText>
      </View>
      
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Correo electrónico</ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
          placeholder="ejemplo@correo.com"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Contraseña</ThemedText>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.passwordInput, { backgroundColor: inputBackground, color: textColor }]}
            placeholder="Tu contraseña"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={24} 
              color="#888" 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity style={styles.forgotPassword}>
        <ThemedText style={[styles.forgotPasswordText, { color: primaryColor }]}>
          ¿Olvidaste tu contraseña?
        </ThemedText>
      </TouchableOpacity>
      
      {error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : null}
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: primaryColor }]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>Iniciar sesión</ThemedText>
        )}
      </TouchableOpacity>
      
      <View style={styles.orContainer}>
        <View style={styles.divider} />
        <ThemedText style={styles.orText}>O</ThemedText>
        <View style={styles.divider} />
      </View>
      
      <TouchableOpacity
        style={[styles.registerButton, { borderColor: primaryColor }]}
        onPress={() => router.push('/register')}
      >
        <ThemedText style={[styles.registerButtonText, { color: primaryColor }]}>
          Crear cuenta nueva
        </ThemedText>
      </TouchableOpacity>
      
      {/* Temporalmente para desarrollo */}
      <View style={styles.devOptions}>
        <ThemedText style={styles.devTitle}>Opciones de desarrollo:</ThemedText>
        <TouchableOpacity 
          style={[styles.devButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => {
            setEmail('admin@ibamex.com');
            setPassword('Admin123');
          }}
        >
          <ThemedText style={styles.devButtonText}>Admin</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.devButton, { backgroundColor: '#2196F3' }]}
          onPress={() => {
            setEmail('driver@ibamex.com');
            setPassword('Driver123');
          }}
        >
          <ThemedText style={styles.devButtonText}>Conductor</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: 8,
  },
  forgotPasswordText: {
    fontWeight: '500',
  },
  errorText: {
    color: '#ff4d4f',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    maxWidth: 400,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  orText: {
    marginHorizontal: 10,
    fontWeight: '500',
  },
  registerButton: {
    width: '100%',
    maxWidth: 400,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  devOptions: {
    marginTop: 30,
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
  },
  devTitle: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  devButton: {
    width: '100%',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  devButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});