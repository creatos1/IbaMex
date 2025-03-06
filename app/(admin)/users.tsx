
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, User } from '@/hooks/useAuth';

// Interfaz extendida para incluir los datos que necesitamos para la gestión
interface UserWithManagementData extends User {
  createdAt?: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'blocked';
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserWithManagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { user } = useAuth();
  
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');
  const inputBackground = useThemeColor({ light: '#f0f0f0', dark: '#2a2a2a' }, 'background');
  const textColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');

  // Para el demo, crear usuarios de ejemplo
  useEffect(() => {
    const mockUsers: UserWithManagementData[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@ibamex.com',
        role: 'admin',
        name: 'Administrador',
        status: 'active',
        createdAt: '2023-01-15',
        lastLogin: '2023-05-20',
        mfaEnabled: true
      },
      {
        id: '2',
        username: 'driver1',
        email: 'driver1@ibamex.com',
        role: 'driver',
        name: 'Conductor 1',
        status: 'active',
        createdAt: '2023-02-10',
        lastLogin: '2023-05-18',
        mfaEnabled: false
      },
      {
        id: '3',
        username: 'driver2',
        email: 'driver2@ibamex.com',
        role: 'driver',
        name: 'Conductor 2',
        status: 'inactive',
        createdAt: '2023-03-05',
        lastLogin: '2023-04-12',
        mfaEnabled: false
      },
      {
        id: '4',
        username: 'user1',
        email: 'user1@example.com',
        role: 'user',
        name: 'Usuario Regular 1',
        status: 'active',
        createdAt: '2023-04-20',
        lastLogin: '2023-05-19',
        mfaEnabled: true
      },
      {
        id: '5',
        username: 'user2',
        email: 'user2@example.com',
        role: 'user',
        name: 'Usuario Regular 2',
        status: 'blocked',
        createdAt: '2023-01-05',
        lastLogin: '2023-03-10',
        mfaEnabled: false
      }
    ];
    
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrar usuarios basado en búsqueda y rol
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = selectedRole ? user.role === selectedRole : true;
    
    return matchesSearch && matchesRole;
  });

  // Cambiar el rol de un usuario
  const handleChangeRole = (userId: string, newRole: 'admin' | 'driver' | 'user') => {
    Alert.alert(
      "Cambiar rol",
      "¿Estás seguro de que deseas cambiar el rol de este usuario?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          onPress: () => {
            setUsers(prevUsers => 
              prevUsers.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
              )
            );
            Alert.alert("Éxito", "Rol actualizado correctamente");
          } 
        }
      ]
    );
  };

  // Cambiar el estado de un usuario
  const handleChangeStatus = (userId: string, newStatus: 'active' | 'inactive' | 'blocked') => {
    const statusText = 
      newStatus === 'active' ? 'activar' : 
      newStatus === 'inactive' ? 'desactivar' : 'bloquear';
    
    Alert.alert(
      `¿${statusText.charAt(0).toUpperCase() + statusText.slice(1)} usuario?`,
      `¿Estás seguro de que deseas ${statusText} a este usuario?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          onPress: () => {
            setUsers(prevUsers => 
              prevUsers.map(user => 
                user.id === userId ? { ...user, status: newStatus } : user
              )
            );
            Alert.alert("Éxito", "Estado actualizado correctamente");
          } 
        }
      ]
    );
  };

  // Botones para filtrar por rol
  const RoleFilters = () => (
    <View style={styles.roleFilters}>
      <TouchableOpacity
        style={[
          styles.roleFilter,
          selectedRole === null && { backgroundColor: primaryColor }
        ]}
        onPress={() => setSelectedRole(null)}
      >
        <ThemedText style={[
          styles.roleFilterText,
          selectedRole === null && { color: 'white' }
        ]}>
          Todos
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.roleFilter,
          selectedRole === 'admin' && { backgroundColor: primaryColor }
        ]}
        onPress={() => setSelectedRole('admin')}
      >
        <ThemedText style={[
          styles.roleFilterText,
          selectedRole === 'admin' && { color: 'white' }
        ]}>
          Administradores
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.roleFilter,
          selectedRole === 'driver' && { backgroundColor: primaryColor }
        ]}
        onPress={() => setSelectedRole('driver')}
      >
        <ThemedText style={[
          styles.roleFilterText,
          selectedRole === 'driver' && { color: 'white' }
        ]}>
          Conductores
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.roleFilter,
          selectedRole === 'user' && { backgroundColor: primaryColor }
        ]}
        onPress={() => setSelectedRole('user')}
      >
        <ThemedText style={[
          styles.roleFilterText,
          selectedRole === 'user' && { color: 'white' }
        ]}>
          Usuarios
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  if (!user || user.role !== 'admin') {
    return (
      <ThemedView style={styles.unauthorizedContainer}>
        <Ionicons name="alert-circle" size={60} color="#ff4d4f" />
        <ThemedText style={styles.unauthorizedText}>
          No tienes permisos para acceder a esta página
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Gestión de Usuarios</ThemedText>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: primaryColor }]}
          onPress={() => Alert.alert("Añadir usuario", "Funcionalidad en desarrollo")}
        >
          <Ionicons name="add" size={24} color="white" />
          <ThemedText style={styles.addButtonText}>Nuevo Usuario</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: inputBackground }]}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Buscar usuarios..."
            placeholderTextColor="#888"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      <RoleFilters />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Cargando usuarios...</ThemedText>
        </View>
      ) : (
        <ScrollView style={styles.usersList}>
          {filteredUsers.length === 0 ? (
            <ThemedView style={styles.noResultsContainer}>
              <Ionicons name="search" size={40} color="#888" />
              <ThemedText style={styles.noResultsText}>
                No se encontraron usuarios
              </ThemedText>
            </ThemedView>
          ) : (
            filteredUsers.map(user => (
              <ThemedView key={user.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <View style={styles.userNameContainer}>
                    <View style={[
                      styles.statusIndicator, 
                      { 
                        backgroundColor: 
                          user.status === 'active' ? '#4CAF50' :
                          user.status === 'inactive' ? '#FFC107' : '#F44336'
                      }
                    ]} />
                    <ThemedText style={styles.userName}>
                      {user.name || user.username}
                    </ThemedText>
                  </View>
                  
                  <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
                  
                  <View style={styles.userDetails}>
                    <View style={styles.userDetail}>
                      <ThemedText style={styles.userDetailLabel}>Rol:</ThemedText>
                      <View style={[
                        styles.roleBadge,
                        { 
                          backgroundColor: 
                            user.role === 'admin' ? '#2196F3' :
                            user.role === 'driver' ? '#4CAF50' : '#9E9E9E'
                        }
                      ]}>
                        <ThemedText style={styles.roleBadgeText}>
                          {user.role === 'admin' ? 'Administrador' :
                           user.role === 'driver' ? 'Conductor' : 'Usuario'}
                        </ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.userDetail}>
                      <ThemedText style={styles.userDetailLabel}>Estado:</ThemedText>
                      <ThemedText style={styles.userDetailValue}>
                        {user.status === 'active' ? 'Activo' :
                         user.status === 'inactive' ? 'Inactivo' : 'Bloqueado'}
                      </ThemedText>
                    </View>
                    
                    <View style={styles.userDetail}>
                      <ThemedText style={styles.userDetailLabel}>MFA:</ThemedText>
                      <ThemedText style={styles.userDetailValue}>
                        {user.mfaEnabled ? 'Activado' : 'Desactivado'}
                      </ThemedText>
                    </View>
                    
                    {user.createdAt && (
                      <View style={styles.userDetail}>
                        <ThemedText style={styles.userDetailLabel}>Creado:</ThemedText>
                        <ThemedText style={styles.userDetailValue}>{user.createdAt}</ThemedText>
                      </View>
                    )}
                    
                    {user.lastLogin && (
                      <View style={styles.userDetail}>
                        <ThemedText style={styles.userDetailLabel}>Último acceso:</ThemedText>
                        <ThemedText style={styles.userDetailValue}>{user.lastLogin}</ThemedText>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.userActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => Alert.alert("Editar usuario", "Funcionalidad en desarrollo")}
                  >
                    <Ionicons name="create-outline" size={20} color={primaryColor} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      Alert.alert(
                        "Cambiar rol",
                        "Selecciona el nuevo rol para este usuario",
                        [
                          { text: "Cancelar", style: "cancel" },
                          { text: "Administrador", onPress: () => handleChangeRole(user.id, 'admin') },
                          { text: "Conductor", onPress: () => handleChangeRole(user.id, 'driver') },
                          { text: "Usuario", onPress: () => handleChangeRole(user.id, 'user') }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="people-outline" size={20} color={primaryColor} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      if (user.status === 'active') {
                        Alert.alert(
                          "Cambiar estado",
                          "¿Qué acción deseas realizar?",
                          [
                            { text: "Cancelar", style: "cancel" },
                            { text: "Desactivar", onPress: () => handleChangeStatus(user.id, 'inactive') },
                            { text: "Bloquear", onPress: () => handleChangeStatus(user.id, 'blocked') }
                          ]
                        );
                      } else if (user.status === 'inactive' || user.status === 'blocked') {
                        handleChangeStatus(user.id, 'active');
                      }
                    }}
                  >
                    <Ionicons 
                      name={
                        user.status === 'active' ? "checkmark-circle-outline" :
                        user.status === 'inactive' ? "reload-outline" : "ban-outline"
                      } 
                      size={20} 
                      color={
                        user.status === 'active' ? '#4CAF50' :
                        user.status === 'inactive' ? '#FFC107' : '#F44336'
                      } 
                    />
                  </TouchableOpacity>
                </View>
              </ThemedView>
            ))
          )}
        </ScrollView>
      )}
    </ThemedView>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  roleFilters: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  roleFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  roleFilterText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  usersList: {
    flex: 1,
  },
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  userCard: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    opacity: 0.7,
    marginBottom: 8,
  },
  userDetails: {
    marginTop: 8,
  },
  userDetail: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  userDetailLabel: {
    fontWeight: '500',
    marginRight: 4,
  },
  userDetailValue: {
    opacity: 0.8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    color: 'white',
    fontSize: 12,
  },
  userActions: {
    justifyContent: 'space-around',
    marginLeft: 16,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unauthorizedText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
});
