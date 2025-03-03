
import React, { useState } from 'react';
import { StyleSheet, TextInput, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');
  const inputBackground = useThemeColor({ light: '#f0f0f0', dark: '#2a2a2a' }, 'background');
  const textColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');

  const handleLogin = () => {
    if (username.toLowerCase() === 'admin' && password) {
      router.replace('/(admin)/dashboard');
    } else if (username.toLowerCase() === 'driver' && password) {
      router.replace('/driver');
    } else {
      Alert.alert('Error', 'Credenciales inválidas. Usa "admin" o "driver" como usuario.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image 
        source={require('@/assets/images/adaptive-icon.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <ThemedText type="title" style={styles.title}>IbaMex</ThemedText>
      
      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
          placeholder="Usuario"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: username && password ? '#0a7ea4' : '#ccc' }]}
          onPress={handleLogin}
          disabled={!username || !password}
        >
          <ThemedText style={styles.buttonText}>Iniciar Sesión</ThemedText>
        </TouchableOpacity>
      </ThemedView>
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
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
