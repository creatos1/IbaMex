
import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
  RefreshControl
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FontAwesome } from '@expo/vector-icons';
import { User } from '@/hooks/useAuth';

interface UserWithManagementData extends User {
  createdAt?: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'blocked';
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserWithManagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { user } = useAuth();
  
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');
  const inputBackground = useThemeColor({ light: '#f0f0f0', dark: '#2a2a2a' }, 'background');
  const textColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#2f95dc' }, 'tint');
  
  // Función para cargar usuarios desde el API
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Aquí iría la llamada a tu API real
      // Para esta demostración, usamos datos simulados
      const mockUsers: UserWithManagementData[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          createdAt: '2023-01-01',
          lastLogin: '2023-06-15'
        },
        {
          id: '2',
          username: 'driver1',
          email: 'driver1@example.com',
          role: 'driver',
          status: 'active',
          createdAt: '2023-02-10',
          lastLogin: '2023-06-13'
        },
        {
          id: '3',
          username: 'user1',
          email: 'user1@example.com',
          role: 'user',
          status: 'active',
          createdAt: '2023-03-15',
          lastLogin: '2023-06-10'
        },
        {
          id: '4',
          username: 'inactiveuser',
          email: 'inactive@example.com',
          role: 'user',
          status: 'inactive',
          createdAt: '2023-04-01',
          lastLogin: '2023-05-01'
        },
      ];
      
      // Simular carga de datos
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Cargar usuarios al iniciar
  useEffect(() => {
    loadUsers();
  }, []);
  
  // Función para refrescar la lista
  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };
  
  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole ? user.role === selectedRole : true;
    return matchesSearch && matchesRole;
  });
  
  // Cambiar rol de usuario
  const changeUserRole = (userId: string, newRole: 'admin' | 'driver' | 'user') => {
    Alert.alert(
      'Cambiar Rol',
      `¿Estás seguro de cambiar el rol de este usuario a ${newRole}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            // Aquí iría la llamada a tu API real
            setUsers(prevUsers => 
              prevUsers.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
              )
            );
            Alert.alert('Éxito', 'Rol actualizado correctamente');
          } 
        }
      ]
    );
  };
  
  // Cambiar estado de usuario
  const changeUserStatus = (userId: string, newStatus: 'active' | 'inactive' | 'blocked') => {
    Alert.alert(
      'Cambiar Estado',
      `¿Estás seguro de cambiar el estado de este usuario a ${newStatus}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            // Aquí iría la llamada a tu API real
            setUsers(prevUsers => 
              prevUsers.map(user => 
                user.id === userId ? { ...user, status: newStatus } : user
              )
            );
            Alert.alert('Éxito', 'Estado actualizado correctamente');
          } 
        }
      ]
    );
  };
  
  // Renderizar tarjeta de usuario
  const renderUserCard = (user: UserWithManagementData) => {
    const statusColors = {
      active: '#4CAF50',
      inactive: '#FF9800',
      blocked: '#F44336'
    };
    
    const roleLabels = {
      admin: 'Administrador',
      driver: 'Conductor',
      user: 'Usuario'
    };
    
    return (
      <ThemedView key={user.id} style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userBasicInfo}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {user.username.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <View>
              <ThemedText style={styles.username}>{user.username}</ThemedText>
              <ThemedText style={styles.email}>{user.email}</ThemedText>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[user.status] }]}>
            <ThemedText style={styles.statusText}>
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Rol:</ThemedText>
            <View style={styles.roleBadge}>
              <ThemedText style={styles.roleText}>
                {roleLabels[user.role]}
              </ThemedText>
            </View>
          </View>
          
          {user.createdAt && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Creado:</ThemedText>
              <ThemedText>{user.createdAt}</ThemedText>
            </View>
          )}
          
          {user.lastLogin && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Último acceso:</ThemedText>
              <ThemedText>{user.lastLogin}</ThemedText>
            </View>
          )}
        </View>
        
        <View style={styles.actionButtons}>
          <View style={styles.actionSection}>
            <ThemedText style={styles.actionTitle}>Cambiar Rol</ThemedText>
            <View style={styles.roleButtons}>
              <TouchableOpacity 
                style={[
                  styles.roleButton, 
                  user.role === 'admin' && { backgroundColor: primaryColor }
                ]}
                onPress={() => changeUserRole(user.id, 'admin')}
                disabled={user.role === 'admin'}
              >
                <ThemedText style={styles.roleButtonText}>Admin</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.roleButton, 
                  user.role === 'driver' && { backgroundColor: primaryColor }
                ]}
                onPress={() => changeUserRole(user.id, 'driver')}
                disabled={user.role === 'driver'}
              >
                <ThemedText style={styles.roleButtonText}>Conductor</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.roleButton, 
                  user.role === 'user' && { backgroundColor: primaryColor }
                ]}
                onPress={() => changeUserRole(user.id, 'user')}
                disabled={user.role === 'user'}
              >
                <ThemedText style={styles.roleButtonText}>Usuario</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.actionSection}>
            <ThemedText style={styles.actionTitle}>Cambiar Estado</ThemedText>
            <View style={styles.statusButtons}>
              <TouchableOpacity 
                style={[
                  styles.statusButton, 
                  { backgroundColor: statusColors.active },
                  user.status === 'active' && styles.disabledButton
                ]}
                onPress={() => changeUserStatus(user.id, 'active')}
                disabled={user.status === 'active'}
              >
                <ThemedText style={styles.statusButtonText}>Activo</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.statusButton, 
                  { backgroundColor: statusColors.inactive },
                  user.status === 'inactive' && styles.disabledButton
                ]}
                onPress={() => changeUserStatus(user.id, 'inactive')}
                disabled={user.status === 'inactive'}
              >
                <ThemedText style={styles.statusButtonText}>Inactivo</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.statusButton, 
                  { backgroundColor: statusColors.blocked },
                  user.status === 'blocked' && styles.disabledButton
                ]}
                onPress={() => changeUserStatus(user.id, 'blocked')}
                disabled={user.status === 'blocked'}
              >
                <ThemedText style={styles.statusButtonText}>Bloqueado</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ThemedView>
    );
  };
  
  if (!user || user.role !== 'admin') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.noPermissionText}>
          No tienes permisos para acceder a esta página
        </ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: inputBackground }]}>
          <FontAwesome name="search" size={16} color={textColor} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Buscar usuario..."
            placeholderTextColor="#999"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <FontAwesome name="times-circle" size={16} color={textColor} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.filterContainer}>
          <ThemedText style={styles.filterLabel}>Filtrar por rol:</ThemedText>
          <View style={styles.filterButtons}>
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                selectedRole === null && { backgroundColor: primaryColor }
              ]}
              onPress={() => setSelectedRole(null)}
            >
              <ThemedText style={styles.filterButtonText}>Todos</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                selectedRole === 'admin' && { backgroundColor: primaryColor }
              ]}
              onPress={() => setSelectedRole('admin')}
            >
              <ThemedText style={styles.filterButtonText}>Admin</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                selectedRole === 'driver' && { backgroundColor: primaryColor }
              ]}
              onPress={() => setSelectedRole('driver')}
            >
              <ThemedText style={styles.filterButtonText}>Conductor</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                selectedRole === 'user' && { backgroundColor: primaryColor }
              ]}
              onPress={() => setSelectedRole('user')}
            >
              <ThemedText style={styles.filterButtonText}>Usuario</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Cargando usuarios...</ThemedText>
        </View>
      ) : (
        <View style={styles.usersList}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => renderUserCard(user))
          ) : (
            <ThemedView style={styles.noResultsContainer}>
              <FontAwesome name="user-times" size={50} color={textColor} />
              <ThemedText style={styles.noResultsText}>
                No se encontraron usuarios
              </ThemedText>
            </ThemedView>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  filterContainer: {
    marginTop: 15,
  },
  filterLabel: {
    marginBottom: 5,
    fontSize: 14,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#ddd',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#fff',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  usersList: {
    padding: 15,
  },
  userCard: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userBasicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userInfo: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'center',
  },
  infoLabel: {
    fontWeight: 'bold',
    marginRight: 5,
    width: 85,
  },
  roleBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 14,
  },
  actionButtons: {
    marginTop: 5,
  },
  actionSection: {
    marginBottom: 10,
  },
  actionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 2,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
    borderRadius: 4,
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 2,
    alignItems: 'center',
    borderRadius: 4,
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  noResultsContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    marginTop: 10,
    fontSize: 16,
  },
  noPermissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});
