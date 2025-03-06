
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout, updateUserProfile, changePassword, toggleMfa } = useAuth();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);
  
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');
  const cardBackground = useThemeColor({ light: '#fff', dark: '#2a2a2a' }, 'background');
  const backgroundColor = useThemeColor({ light: '#f5f5f5', dark: '#151718' }, 'background');
  
  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };
  
  const handleSaveProfile = async () => {
    // Validar datos
    if (!userData.name.trim() || !userData.email.trim() || !userData.username.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    
    // Actualizar perfil
    const success = await updateUserProfile({
      name: userData.name,
      email: userData.email,
      username: userData.username,
    });
    
    if (success) {
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setIsEditing(false);
    } else {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };
  
  const handleChangePassword = async () => {
    // Validar contraseñas
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }
    
    // Cambiar contraseña
    const success = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    
    if (success) {
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      Alert.alert('Error', 'No se pudo actualizar la contraseña');
    }
  };
  
  const handleToggleMfa = async (value: boolean) => {
    // Si está habilitando MFA, mostrar confirmación
    if (value && !mfaEnabled) {
      Alert.alert(
        'Activar MFA',
        'Se enviará un código de verificación a tu correo electrónico cada vez que inicies sesión. ¿Deseas continuar?',
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
          <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          
          <ThemedText style={styles.username}>{user?.username}</ThemedText>
          
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.role || 'user') }]}>
            <ThemedText style={styles.roleBadgeText}>{getRoleLabel(user?.role || 'user')}</ThemedText>
          </View>
        </View>
        
        <ThemedView style={[styles.section, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Información Personal</ThemedText>
            {!isEditing ? (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Ionicons name="create-outline" size={24} color={primaryColor} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Ionicons name="close-outline" size={24} color="#F44336" />
              </TouchableOpacity>
            )}
          </View>
          
          {!isEditing ? (
            <View style={styles.profileInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={20} color={primaryColor} />
                <ThemedText style={styles.infoText}>{userData.name || user?.name || 'No especificado'}</ThemedText>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={20} color={primaryColor} />
                <ThemedText style={styles.infoText}>{userData.email || user?.email}</ThemedText>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="at" size={20} color={primaryColor} />
                <ThemedText style={styles.infoText}>{userData.username || user?.username}</ThemedText>
              </View>
            </View>
          ) : (
            <View style={styles.editForm}>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Nombre completo</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor, color: useThemeColor({ light: '#000', dark: '#fff' }, 'text') }]}
                  value={userData.name}
                  onChangeText={(text) => setUserData({ ...userData, name: text })}
                  placeholder="Nombre completo"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Correo electrónico</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor, color: useThemeColor({ light: '#000', dark: '#fff' }, 'text') }]}
                  value={userData.email}
                  onChangeText={(text) => setUserData({ ...userData, email: text })}
                  placeholder="Correo electrónico"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Nombre de usuario</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor, color: useThemeColor({ light: '#000', dark: '#fff' }, 'text') }]}
                  value={userData.username}
                  onChangeText={(text) => setUserData({ ...userData, username: text })}
                  placeholder="Nombre de usuario"
                  placeholderTextColor="#999"
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: primaryColor }]}
                onPress={handleSaveProfile}
              >
                <ThemedText style={styles.saveButtonText}>Guardar Cambios</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>
        
        <ThemedView style={[styles.section, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Cambiar Contraseña</ThemedText>
          </View>
          
          <View style={styles.editForm}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Contraseña actual</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor, color: useThemeColor({ light: '#000', dark: '#fff' }, 'text') }]}
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                placeholder="Contraseña actual"
                placeholderTextColor="#999"
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Nueva contraseña</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor, color: useThemeColor({ light: '#000', dark: '#fff' }, 'text') }]}
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                placeholder="Nueva contraseña"
                placeholderTextColor="#999"
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Confirmar nueva contraseña</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor, color: useThemeColor({ light: '#000', dark: '#fff' }, 'text') }]}
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                placeholder="Confirmar nueva contraseña"
                placeholderTextColor="#999"
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: primaryColor }]}
              onPress={handleChangePassword}
            >
              <ThemedText style={styles.saveButtonText}>Cambiar Contraseña</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
        
        <ThemedView style={[styles.section, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Seguridad</ThemedText>
          </View>
          
          <View style={styles.securityOption}>
            <View>
              <ThemedText style={styles.securityOptionTitle}>Autenticación de dos factores</ThemedText>
              <ThemedText style={styles.securityOptionDescription}>Habilitar verificación adicional al iniciar sesión</ThemedText>
            </View>
            <Switch
              value={mfaEnabled}
              onValueChange={handleToggleMfa}
              trackColor={{ false: '#767577', true: primaryColor }}
              thumbColor={mfaEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </ThemedView>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <ThemedText style={styles.logoutText}>Cerrar Sesión</ThemedText>
        </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleBadgeText: {
    color: 'white',
    fontWeight: '500',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
  },
  editForm: {
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  securityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  securityOptionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
    marginBottom: 32,
  },
  logoutText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
