
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from '@/components/auth/LoginScreen';
import { AuthProvider } from '@/hooks/useAuth';

export default function Login() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <LoginScreen />
    </AuthProvider>
  );
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
