
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
