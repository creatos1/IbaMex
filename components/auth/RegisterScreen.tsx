
import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');
  const inputBackground = useThemeColor({ light: '#f0f0f0', dark: '#2a2a2a' }, 'background');
  const textColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');

  // Validar campos
  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!username) newErrors.username = 'El nombre de usuario es requerido';
    else if (username.length < 3) newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    
    if (!email) newErrors.email = 'El correo electrónico es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'El correo electrónico no es válido';
    
    if (!password) newErrors.password = 'La contraseña es requerida';
    else if (password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número';
    }
    
    if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    
    const success = await register(username, email, password);
    
    if (success) {
      Alert.alert(
        "Registro exitoso", 
        "Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.",
        [{ text: "OK", onPress: () => router.replace('/') }]
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollView}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>Crear cuenta</ThemedText>
          <ThemedText style={styles.subtitle}>Regístrate para acceder a todas las funciones</ThemedText>
        </View>
        
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Nombre de usuario</ThemedText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBackground, color: textColor },
                errors.username ? styles.inputError : {}
              ]}
              placeholder="Ingresa tu nombre de usuario"
              placeholderTextColor="#888"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            {errors.username ? (
              <ThemedText style={styles.errorText}>{errors.username}</ThemedText>
            ) : null}
          </View>
          
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Correo electrónico</ThemedText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBackground, color: textColor },
                errors.email ? styles.inputError : {}
              ]}
              placeholder="Ingresa tu correo electrónico"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email ? (
              <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
            ) : null}
          </View>
          
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Contraseña</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  { backgroundColor: inputBackground, color: textColor },
                  errors.password ? styles.inputError : {}
                ]}
                placeholder="Ingresa tu contraseña"
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
            {errors.password ? (
              <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
            ) : null}
          </View>
          
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Confirmar contraseña</ThemedText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBackground, color: textColor },
                errors.confirmPassword ? styles.inputError : {}
              ]}
              placeholder="Confirma tu contraseña"
              placeholderTextColor="#888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
            {errors.confirmPassword ? (
              <ThemedText style={styles.errorText}>{errors.confirmPassword}</ThemedText>
            ) : null}
          </View>
          
          {error ? (
            <ThemedText style={styles.serverError}>{error}</ThemedText>
          ) : null}
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: primaryColor }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Registrarse</ThemedText>
            )}
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <ThemedText>¿Ya tienes una cuenta? </ThemedText>
            <TouchableOpacity onPress={() => router.replace('/')}>
              <ThemedText style={[styles.loginText, { color: primaryColor }]}>
                Iniciar sesión
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
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
  inputError: {
    borderWidth: 1,
    borderColor: '#ff4d4f',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 12,
    marginTop: 4,
  },
  serverError: {
    color: '#ff4d4f',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontWeight: 'bold',
  },
});
