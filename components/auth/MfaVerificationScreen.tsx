
import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export default function MfaVerificationScreen() {
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);
  const router = useRouter();

  const { verifyMfa, error, isLoading } = useAuth();

  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#1c1c1c' }, 'background');
  const textColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const borderColor = useThemeColor({ light: '#ccc', dark: '#444' }, 'text');

  // Efecto para manejar el temporizador de reenvío
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timer > 0 && !isResendActive) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendActive(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, isResendActive]);

  // Manejar la verificación del código MFA
  const handleVerifyCode = async () => {
    if (code.length < 6) {
      return;
    }

    const success = await verifyMfa(code);

    if (success) {
      router.replace('/');
    }
  };

  // Manejar el reenvío del código
  const handleResendCode = () => {
    if (!isResendActive) return;

    // Aquí iría la lógica para solicitar un nuevo código
    // ...

    // Reiniciar el temporizador
    setTimer(60);
    setIsResendActive(false);
  };

  // Manejar el botón de cancelar
  const handleCancel = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Ionicons 
          name="shield-checkmark-outline" 
          size={80} 
          color={primaryColor} 
          style={styles.icon}
        />

        <ThemedText style={styles.title}>
          Verificación en dos pasos
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          Ingrese el código de verificación que se envió a su correo electrónico
        </ThemedText>

        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        <View style={styles.codeInputContainer}>
          <TextInput
            style={[styles.codeInput, { borderColor, color: textColor }]}
            placeholder="Código de 6 dígitos"
            placeholderTextColor={borderColor}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, { backgroundColor: primaryColor }]}
          onPress={handleVerifyCode}
          disabled={isLoading || code.length < 6}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.verifyButtonText}>
              Verificar código
            </ThemedText>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <ThemedText style={styles.resendText}>
            ¿No recibiste el código? 
          </ThemedText>
          <TouchableOpacity onPress={handleResendCode} disabled={!isResendActive} style={styles.resendLink}>
            <ThemedText style={[styles.resendText, styles.resendTextBold, { color: isResendActive ? primaryColor : borderColor }]}>
              {isResendActive ? 'Reenviar código' : `Reenviar en ${timer}s`}
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
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
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
  },
  codeInputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  codeInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
  verifyButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  resendText: {
    fontSize: 14,
    marginRight: 4,
    textAlign: 'center',
  },
  resendTextBold: {
    fontWeight: 'bold',
  },
  resendLink: {
    padding: 4,
  },
  cancelButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
});
