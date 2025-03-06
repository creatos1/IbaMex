
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Switch, Alert, ScrollView } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

export default function UserProfileScreen() {
  const { user, isLoading, error, updateUserProfile, changePassword, toggleMfa, logout } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#1c1c1c' }, 'background');
  const textColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const borderColor = useThemeColor({ light: '#ccc', dark: '#444' }, 'border');
  const cardBgColor = useThemeColor({ light: '#f5f5f5', dark: '#2c2c2c' }, 'card');

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setMfaEnabled(user.mfaEnabled || false);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (isEditing) {
      const success = await updateUserProfile({ name });
      if (success) {
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    const success = await changePassword(currentPassword, newPassword);
    if (success) {
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const handleToggleMfa = async (value: boolean) => {
    const success = await toggleMfa(value);
    if (success) {
      setMfaEnabled(value);
      Alert.alert(
        'Éxito', 
        value 
          ? 'Autenticación en dos pasos activada' 
          : 'Autenticación en dos pasos desactivada'
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: () => logout() }
      ]
    );
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Debes iniciar sesión para ver tu perfil</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Mi Perfil</ThemedText>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
        
        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}
        
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle-outline" size={30} color={primaryColor} />
            <ThemedText style={styles.cardTitle}>Información personal</ThemedText>
          </View>
          
          <View style={styles.inputRow}>
            <ThemedText style={styles.inputLabel}>Usuario</ThemedText>
            <ThemedText style={styles.inputValue}>{user.username}</ThemedText>
          </View>
          
          <View style={styles.inputRow}>
            <ThemedText style={styles.inputLabel}>Nombre</ThemedText>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                value={name}
                onChangeText={setName}
                placeholder="Tu nombre"
                placeholderTextColor="#888"
              />
            ) : (
              <ThemedText style={styles.inputValue}>{name || 'No especificado'}</ThemedText>
            )}
          </View>
          
          <View style={styles.inputRow}>
            <ThemedText style={styles.inputLabel}>Email</ThemedText>
            <ThemedText style={styles.inputValue}>{email}</ThemedText>
          </View>
          
          <View style={styles.inputRow}>
            <ThemedText style={styles.inputLabel}>Rol</ThemedText>
            <View style={[styles.roleBadge, { backgroundColor: primaryColor }]}>
              <ThemedText style={styles.roleBadgeText}>
                {user.role === 'admin' ? 'Administrador' : 
                 user.role === 'driver' ? 'Conductor' : 'Usuario'}
              </ThemedText>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: primaryColor }]}
            onPress={handleUpdateProfile}
          >
            <ThemedText style={styles.buttonText}>
              {isEditing ? 'Guardar cambios' : 'Editar perfil'}
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="lock-closed-outline" size={30} color={primaryColor} />
            <ThemedText style={styles.cardTitle}>Cambiar contraseña</ThemedText>
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholderTextColor="#888"
                placeholder="Contraseña actual"
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity 
                style={styles.passwordToggle} 
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Ionicons 
                  name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={textColor} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholderTextColor="#888"
                placeholder="Nueva contraseña"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity 
                style={styles.passwordToggle} 
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons 
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={textColor} 
                />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholderTextColor="#888"
              placeholder="Confirmar nueva contraseña"
              secureTextEntry={!showNewPassword}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: primaryColor }]}
            onPress={handleChangePassword}
          >
            <ThemedText style={styles.buttonText}>Cambiar contraseña</ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark-outline" size={30} color={primaryColor} />
            <ThemedText style={styles.cardTitle}>Seguridad</ThemedText>
          </View>
          
          <View style={styles.settingRow}>
            <View>
              <ThemedText style={styles.settingLabel}>Autenticación en dos pasos</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Aumenta la seguridad de tu cuenta requiriendo un código adicional al iniciar sesión
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
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  errorContainer: {
    backgroundColor: '#ffecec',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#d63031',
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  inputRow: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.7,
  },
  inputValue: {
    fontSize: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  inputContainer: {
    marginBottom: 16,
  },
  passwordInputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  passwordToggle: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  button: {
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    color: 'white',
    fontSize: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.7,
    maxWidth: '80%',
  },
});
