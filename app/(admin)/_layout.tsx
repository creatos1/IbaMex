import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, Tabs } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/hooks/useAuth';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

// Componentes de iconos separados para mejorar la claridad
const DashboardIcon = ({color}: {color: string}) => <Ionicons name="stats-chart" size={24} color={color} />;
const RoutesIcon = ({color}: {color: string}) => <Ionicons name="map" size={24} color={color} />;
const BusesIcon = ({color}: {color: string}) => <Ionicons name="bus" size={24} color={color} />;
const UsersIcon = ({color}: {color: string}) => <Ionicons name="people" size={24} color={color} />;

export default function AdminLayout() {
  const router = useRouter();
  const tintColor = useThemeColor({ light: '#0a7ea4', dark: '#fff' }, 'tint');
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');
  const tabIconDefault = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'tabIconDefault');
  const { signOut } = useAuth();

  // Función para cerrar sesión
  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: tabIconDefault,
        tabBarStyle: {
          backgroundColor: backgroundColor,
        },
        headerStyle: {
          backgroundColor: backgroundColor,
        },
        headerTintColor: tintColor,
        headerRight: () => (
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={tintColor} />
            <ThemedText style={styles.logoutText}>Cerrar Sesión</ThemedText>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Panel Admin',
          tabBarIcon: ({ color }) => <DashboardIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          title: 'Rutas',
          tabBarIcon: ({ color }) => <RoutesIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="buses"
        options={{
          title: 'Autobuses',
          tabBarIcon: ({ color }) => <BusesIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Usuarios',
          tabBarIcon: ({ color }) => <UsersIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  logoutText: {
    marginLeft: 5,
    fontSize: 14,
  },
});