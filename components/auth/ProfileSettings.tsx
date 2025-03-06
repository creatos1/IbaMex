
import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Switch } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileSettings() {
  const { user, updateUserProfile, changePassword, toggleMfa, isLoading, error } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');
  const inputBackground = useThemeColor({ light: '#f0f0f0', dark: '#2a2a2a' }, 'background');
  const textColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');

  const handleUpdateProfile = async () => {
    const success = await updateUserProfile({ name });
    
    if (success) {
      Alert.alert("Perfil actualizado", "Tu información de perfil ha sido actualizada correctamente.");
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword) {
      Alert.alert("Error", "Por favor ingresa tu contraseña actual");
      return;
    }
    
    if (!newPassword) {
      Alert.alert("Error", "Por favor ingresa una nueva contraseña");
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert("Error", "La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    
    const success = await changePassword(oldPassword, newPassword);
    
    if (success) {
      Alert.alert("Contraseña actualizada", "Tu contraseña ha sido actualizada correctamente.");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleToggleMfa = async (value: boolean) => {
    // Si está activando MFA, mostrar instrucciones
    if (value && !mfaEnabled) {
      Alert.alert(
        "Activar verificación en dos pasos",
        "La próxima vez que inicies sesión, se te enviará un código de verificación a tu correo electrónico.",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Activar",
            onPress: async () => {
              const success = await toggleMfa(true);
              if (success) {
                setMfaEnabled(true);
              }
            }
          }
        ]
      );
    } else if (!value && mfaEnabled) {
      // Si está desactivando MFA, confirmar
      Alert.alert(
        "Desactivar verificación en dos pasos",
        "¿Estás seguro de que deseas desactivar la verificación en dos pasos?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Desactivar",
            onPress: async () => {
              const success = await toggleMfa(false);
              if (success) {
                setMfaEnabled(false);
              }
            }
          }
        ]
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons 
            name="person" 
            size={24} 
            color={activeTab === 'profile' ? primaryColor : textColor} 
          />
          <ThemedText style={[styles.tabText, activeTab === 'profile' && { color: primaryColor }]}>
            Perfil
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'security' && styles.activeTab]}
          onPress={() => setActiveTab('security')}
        >
          <Ionicons 
            name="shield" 
            size={24} 
            color={activeTab === 'security' ? primaryColor : textColor} 
          />
          <ThemedText style={[styles.tabText, activeTab === 'security' && { color: primaryColor }]}>
            Seguridad
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {activeTab === 'profile' ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Información personal</ThemedText>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Nombre completo</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
                placeholder="Tu nombre"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
              />
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Correo electrónico</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
                value={user?.email}
                editable={false}
              />
              <ThemedText style={styles.helperText}>
                El correo electrónico no se puede cambiar
              </ThemedText>
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Nombre de usuario</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
                value={user?.username}
                editable={false}
              />
              <ThemedText style={styles.helperText}>
                El nombre de usuario no se puede cambiar
              </ThemedText>
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Rol</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
                value={user?.role === 'admin' ? 'Administrador' : user?.role === 'driver' ? 'Conductor' : 'Usuario'}
                editable={false}
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
          </View>
        ) : (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Cambiar contraseña</ThemedText>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Contraseña actual</ThemedText>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, { backgroundColor: inputBackground, color: textColor }]}
                  placeholder="Ingresa tu contraseña actual"
                  placeholderTextColor="#888"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={24} 
                    color="#888" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Nueva contraseña</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
                placeholder="Ingresa tu nueva contraseña"
                placeholderTextColor="#888"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />
              <ThemedText style={styles.helperText}>
                La contraseña debe tener al menos 8 caracteres
              </ThemedText>
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Confirmar nueva contraseña</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
                placeholder="Confirma tu nueva contraseña"
                placeholderTextColor="#888"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
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
                thumbColor={mfaEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  helperText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  errorText: {
    color: '#ff4d4f',
    marginBottom: 16,
  },
  button: {
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
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontWeight: '500',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
});
