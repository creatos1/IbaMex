import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/hooks/useAuth';

export default function MfaVerificationScreen() {
  const [code, setCode] = useState('');
  const { verifyMfa, isLoading, error } = useAuth();
  const router = useRouter();

  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');

  const handleVerify = async () => {
    if (!code) {
      Alert.alert('Error', 'Por favor ingresa el código de verificación');
      return;
    }

    try {
      const success = await verifyMfa(code);
      if (success) {
        // La navegación será manejada por el hook useAuth
      } else if (error) {
        Alert.alert('Error', error);
      }
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error al verificar el código. Por favor intenta de nuevo.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentContainer}>
        <ThemedText style={styles.title}>Verificación en dos pasos</ThemedText>
        <ThemedText style={styles.subtitle}>
          Por favor ingresa el código que fue enviado a tu correo electrónico.
        </ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Código de verificación"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
        />

        <TouchableOpacity 
          style={[styles.button, {backgroundColor: primaryColor}]}
          onPress={handleVerify}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>
              Verificar
            </ThemedText>
          )}
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
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
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
  input: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});