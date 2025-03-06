
import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export default function MfaVerificationScreen() {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const router = useRouter();
  const { verifyMfa, isLoading, error } = useAuth();
  
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');
  const inputBackground = useThemeColor({ light: '#f0f0f0', dark: '#2a2a2a' }, 'background');
  const textColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');

  // Contador regresivo para el código
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleVerify = async () => {
    if (!code) {
      return;
    }
    
    const success = await verifyMfa(code);
    
    if (success) {
      // La redirección se maneja en el AuthProvider
    }
  };

  const handleResendCode = () => {
    // Aquí iría la lógica para reenviar el código
    setTimeLeft(30);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="shield-checkmark" size={60} color={primaryColor} style={styles.icon} />
        
        <ThemedText style={styles.title}>Verificación en dos pasos</ThemedText>
        
        <ThemedText style={styles.description}>
          Hemos enviado un código de verificación a tu correo electrónico. 
          Ingresa el código a continuación para completar el inicio de sesión.
        </ThemedText>
        
        <TextInput
          style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
          placeholder="Código de verificación"
          placeholderTextColor="#888"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />
        
        {error ? (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        ) : null}
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={handleVerify}
          disabled={isLoading || !code}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Verificar</ThemedText>
          )}
        </TouchableOpacity>
        
        <View style={styles.resendContainer}>
          {timeLeft > 0 ? (
            <ThemedText>Puedes solicitar un nuevo código en {timeLeft} segundos</ThemedText>
          ) : (
            <TouchableOpacity onPress={handleResendCode}>
              <ThemedText style={[styles.resendText, { color: primaryColor }]}>
                Reenviar código
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    textAlign: 'center',
    fontSize: 20,
    letterSpacing: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff4d4f',
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
  resendContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    fontWeight: 'bold',
  },
});
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

export default function MfaVerificationScreen() {
  const [code, setCode] = useState('');
  const { verifyMfa, isLoading, error, needsMfa } = useAuth();
  const router = useRouter();
  
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#1c1c1c' }, 'background');
  const textColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const borderColor = useThemeColor({ light: '#ccc', dark: '#444' }, 'border');

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Redirigir si no se requiere MFA
    if (!needsMfa) {
      router.replace('/');
    }
  }, [needsMfa, router]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Error', 'Por favor ingresa un código válido de 6 dígitos');
      return;
    }

    const success = await verifyMfa(code);
    if (success) {
      router.replace('/');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="shield-checkmark-outline" size={80} color={primaryColor} />
        
        <ThemedText style={styles.title}>Verificación en dos pasos</ThemedText>
        
        <ThemedText style={styles.description}>
          Hemos enviado un código de verificación a tu correo electrónico. 
          Por favor, ingrésalo a continuación para continuar.
        </ThemedText>
        
        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}
        
        <View style={styles.codeInputContainer}>
          <TextInput
            ref={inputRef}
            style={[styles.codeInput, { color: textColor, borderColor }]}
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            placeholderTextColor="#888"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
        </View>
        
        <TouchableOpacity
          style={[styles.verifyButton, { backgroundColor: primaryColor }]}
          onPress={handleVerify}
          disabled={isLoading}
        >
          <ThemedText style={styles.verifyButtonText}>
            Verificar
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resendLink}>
          <ThemedText style={styles.resendText}>
            ¿No recibiste el código? <ThemedText style={styles.resendTextBold}>Reenviar</ThemedText>
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => router.replace('/')}
        >
          <ThemedText style={styles.cancelButtonText}>
            Cancelar
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  errorContainer: {
    backgroundColor: '#ffecec',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    width: '100%',
  },
  errorText: {
    color: '#d63031',
    textAlign: 'center',
  },
  codeInputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  codeInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 10,
  },
  verifyButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendLink: {
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
  },
  resendTextBold: {
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 10,
  },
  cancelButtonText: {
    fontSize: 14,
  },
});
