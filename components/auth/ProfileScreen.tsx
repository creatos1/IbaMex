
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuth';
import { useThemeColor } from '@/hooks/useThemeColor';

type TabType = 'profile' | 'security';

export default function ProfileScreen() {
  const { user, updateProfile, changePassword, toggleMfa, signOut, isLoading, error } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // Profile data
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Security data
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);
  const [showPassword, setShowPassword] = useState(false);
  
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');
  
  const handleUpdateProfile = async () => {
    if (!username || !email) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    
    const success = await updateProfile({
      username,
      email
    });
    
    if (success) {
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } else if (error) {
      Alert.alert('Error', error);
    }
  };
  
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    const success = await changePassword(oldPassword, newPassword);
    
    if (success) {
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else if (error) {
      Alert.alert('Error', error);
    }
  };
  
  const handleToggleMfa = async (value: boolean) => {
    if (value && !mfaEnabled) {
      // Si está activando MFA, mostrar confirmación
      Alert.alert(
        'Activar MFA',
        'Esto añadirá un paso adicional al iniciar sesión. ¿Deseas continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Activar',
            onPress: async () => {
              const success = await toggleMfa(true);
              if (success) {
                setMfaEnabled(true);
                Alert.alert('Éxito', 'Autenticación de dos factores activada');
              } else {
                Alert.alert('Error', 'No se pudo activar la autenticación de dos factores');
              }
            }
          }
        ]
      );
    } else if (!value && mfaEnabled) {
      // Si está desactivando MFA, mostrar advertencia
      Alert.alert(
        'Desactivar MFA',
        'Esto reducirá la seguridad de tu cuenta. ¿Estás seguro?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desactivar',
            style: 'destructive',
            onPress: async () => {
              const success = await toggleMfa(false);
              if (success) {
                setMfaEnabled(false);
                Alert.alert('Éxito', 'Autenticación de dos factores desactivada');
              } else {
                Alert.alert('Error', 'No se pudo desactivar la autenticación de dos factores');
              }
            }
          }
        ]
      );
    }
  };
  
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'driver': return 'Conductor';
      default: return 'Usuario';
    }
  };
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#F44336';
      case 'driver': return '#2196F3';
      default: return '#4CAF50';
    }
  };
  
  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: getRoleColor(user?.role || 'user') }]}>
            <ThemedText style={styles.avatarText}>
              {user?.username?.substring(0, 1).toUpperCase() || 'U'}
            </ThemedText>
          </View>
          <View style={styles.userInfo}>
            <ThemedText style={styles.userName}>{user?.username || 'Usuario'}</ThemedText>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.role || 'user') }]}>
              <ThemedText style={styles.roleText}>
                {getRoleLabel(user?.role || 'user')}
              </ThemedText>
            </View>
          </View>
        </View>
        
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
            onPress={() => setActiveTab('profile')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
              Perfil
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'security' && styles.activeTab]}
            onPress={() => setActiveTab('security')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'security' && styles.activeTabText]}>
              Seguridad
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'profile' ? (
          <View style={styles.tabContent}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Nombre de usuario</ThemedText>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Nombre de usuario"
              />
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Correo electrónico</ThemedText>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            {error && activeTab === 'profile' ? (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : null}
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: primaryColor }]}
              onPress={handleUpdateProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Guardar cambios</ThemedText>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.logoutButton]}
              onPress={() => {
                Alert.alert(
                  'Cerrar sesión',
                  '¿Estás seguro que deseas cerrar sesión?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Cerrar sesión', style: 'destructive', onPress: signOut }
                  ]
                );
              }}
            >
              <ThemedText style={styles.logoutText}>Cerrar sesión</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tabContent}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Contraseña actual</ThemedText>
              <View style={styles.passwordInput}>
                <TextInput
                  style={styles.input}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Contraseña actual"
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Nueva contraseña</ThemedText>
              <View style={styles.passwordInput}>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Nueva contraseña"
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Confirmar nueva contraseña</ThemedText>
              <View style={styles.passwordInput}>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirmar nueva contraseña"
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>
            
            <View style={styles.switchRow}>
              <ThemedText style={styles.switchLabel}>Mostrar contraseñas</ThemedText>
              <Switch
                value={showPassword}
                onValueChange={setShowPassword}
                trackColor={{ false: '#767577', true: primaryColor }}
                thumbColor="#f4f3f4"
              />
            </View>
            
            {error && activeTab === 'security' ? (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : null}
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: primaryColor }]}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Cambiar contraseña</ThemedText>
              )}
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <ThemedText style={styles.sectionTitle}>Verificación en dos pasos</ThemedText>
            
            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <ThemedText style={styles.switchLabel}>Verificación en dos pasos</ThemedText>
                <ThemedText style={styles.switchDescription}>
                  Aumenta la seguridad de tu cuenta requiriendo un código adicional cuando inicies sesión
                </ThemedText>
              </View>
              <Switch
                value={mfaEnabled}
                onValueChange={handleToggleMfa}
                trackColor={{ false: '#767577', true: primaryColor }}
                thumbColor="#f4f3f4"
              />
            </View>
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0a7ea4',
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  tabContent: {
    paddingTop: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flexDirection: 'row',
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
  errorText: {
    color: '#F44336',
    marginBottom: 10,
  },
  logoutButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  logoutText: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
    marginRight: 10,
  },
  switchLabel: {
    fontSize: 16,
  },
  switchDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 3,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
});
