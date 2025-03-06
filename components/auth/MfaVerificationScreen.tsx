import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/hooks/useAuth';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

const MfaVerificationScreen = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const { needsMfa, verifyMfa, error } = useAuth();
  const router = useRouter();

  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');

  // Redirigir si no se necesita MFA
  useEffect(() => {
    if (!needsMfa) {
      router.replace('/');
    }
  }, [needsMfa, router]);

  // Contador para reenvío de código
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (!code) {
      Alert.alert('Error', 'Por favor ingresa el código de verificación');
      return;
    }

    if (code.length < 6) {
      Alert.alert('Error', 'El código debe tener 6 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      const success = await verifyMfa(code);
      if (success) {
        router.replace('/');
      } else {
        Alert.alert('Error', error || 'Código inválido. Por favor intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    // Aquí iría la lógica para reenviar el código
    Alert.alert('Reenviar código', 'Se ha enviado un nuevo código a tu correo electrónico.');
    setCountdown(30);
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.iconContainer}>
        <FontAwesome name="lock" size={50} color={primaryColor} />
      </View>

      <ThemedText style={styles.title}>Verificación en dos pasos</ThemedText>
      <ThemedText style={styles.subtitle}>
        Ingresa el código de verificación que hemos enviado a tu correo electrónico
      </ThemedText>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Código de verificación"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={handleVerify}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Verificar</ThemedText>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          {countdown > 0 ? (
            <ThemedText style={styles.countdownText}>
              Puedes reenviar el código en {countdown} segundos
            </ThemedText>
          ) : (
            <TouchableOpacity onPress={handleResendCode}>
              <ThemedText style={[styles.resendText, { color: primaryColor }]}>
                Reenviar código
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 5,
    backgroundColor: '#fff',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 14,
    opacity: 0.7,
  },
  resendText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MfaVerificationScreen;