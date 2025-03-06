
import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from "c:/Users/52449/Downloads/IbaMex (6)/IbaMex/components/ThemedText";
import useAuth from '@/hooks/useAuth';
import { Colors } from "c:/Users/52449/Downloads/IbaMex (6)/IbaMex/constants/Colors";

const RegisterScreen = () => {
  const router = useRouter();
  const { signUp, error: authError, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  
  // Estados locales
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(authError);
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Colores según el tema
  const primaryColor = Colors[colorScheme ?? 'light'].tint;
  const backgroundColor = colorScheme === 'dark' ? '#121212' : '#f5f5f5';
  const textColor = colorScheme === 'dark' ? '#ffffff' : '#000000';
  const inputBackground = colorScheme === 'dark' ? '#333' : '#fff';
  
  // Validación de campos
  const validateFields = () => {
    const newErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    let isValid = true;
    
    // Validar nombre de usuario
    if (!username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
      isValid = false;
    }
    
    // Validar email
    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
      isValid = false;
    }
    
    // Validar contraseña
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }
    
    // Validar confirmación de contraseña
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Manejar registro
  const handleRegister = async () => {
    if (!validateFields()) {
      return;
    }
    
    try {
      console.log('Intentando registrar usuario...');
      const success = await signUp(username, email, password);
      
      if (success) {
        console.log('Registro exitoso, redirigiendo a login');
        // Redirigir a la pantalla de login
        router.push('/login');
      } else {
        setError(authError || 'Error durante el registro');
      }
    } catch (err) {
      console.error('Error en handleRegister:', err);
      setError('Ha ocurrido un error inesperado');
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: backgroundColor }}
      >
        <View style={[styles.container, { backgroundColor: backgroundColor }]}>
          <ThemedText style={styles.title}>Crear Cuenta</ThemedText>
          <ThemedText style={styles.subtitle}>Regístrate para comenzar</ThemedText>
          
          {/* Nombre de usuario */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Nombre de usuario</ThemedText>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: inputBackground, color: textColor },
                errors.username ? styles.inputError : null
              ]}
              placeholderTextColor="#888"
              placeholder="Ingresa tu nombre de usuario"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            {errors.username ? (
              <ThemedText style={styles.errorText}>{errors.username}</ThemedText>
            ) : null}
          </View>
          
          {/* Email */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Correo electrónico</ThemedText>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: inputBackground, color: textColor },
                errors.email ? styles.inputError : null
              ]}
              placeholderTextColor="#888"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? (
              <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
            ) : null}
          </View>
          
          {/* Contraseña */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Contraseña</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input, 
                  styles.passwordInput,
                  { backgroundColor: inputBackground, color: textColor },
                  errors.password ? styles.inputError : null
                ]}
                placeholderTextColor="#888"
                placeholder="Crea tu contraseña"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.visibilityToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
            ) : null}
          </View>
          
          {/* Confirmar Contraseña */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Confirmar contraseña</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input, 
                  styles.passwordInput,
                  { backgroundColor: inputBackground, color: textColor },
                  errors.confirmPassword ? styles.inputError : null
                ]}
                placeholderTextColor="#888"
                placeholder="Confirma tu contraseña"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
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
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.buttonText}>Registrarse</ThemedText>
            )}
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <ThemedText>¿Ya tienes una cuenta? </ThemedText>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <ThemedText style={{ color: primaryColor, fontWeight: 'bold' }}>
                Inicia sesión
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
  },
  serverError: {
    color: '#ff3b30',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 40,
  },
  visibilityToggle: {
    position: 'absolute',
    right: 10,
    top: 12,
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
});

export default RegisterScreen;
