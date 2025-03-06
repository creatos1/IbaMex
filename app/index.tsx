
import React from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.title}>¡Bienvenido, {user.username}!</Text>
          <Button 
            title="Ir al Perfil" 
            onPress={() => router.push('/(tabs)/profile')}
          />
        </>
      ) : (
        <>
          <Text style={styles.title}>Bienvenido a IbaMex</Text>
          <View style={styles.buttonContainer}>
            <Button 
              title="Iniciar Sesión" 
              onPress={() => router.push('/login')}
            />
            <Button 
              title="Registrarse" 
              onPress={() => router.push('/register')}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});
