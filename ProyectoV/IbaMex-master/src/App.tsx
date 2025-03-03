
import { useState, useEffect } from 'react';
import './App.css';
import RouteManager from './components/RouteManager';
import DataAnalytics from './components/DataAnalytics';

// Tipos para nuestra aplicación
interface Bus {
  id: string;
  routeId: string;
  routeName: string;
  occupancyPercentage: number;
  location: {
    lat: number;
    lng: number;
  };
  nextStop: string;
}

interface Route {
  id: string;
  name: string;
  description: string;
  stops: string[];
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeView, setActiveView] = useState<'dashboard' | 'routes' | 'analytics'>('dashboard');
  const [token, setToken] = useState('dummy-token'); // In a real app, this would be a JWT token

  // Efecto para simular carga de rutas (en producción, esto vendría de tu API)
  useEffect(() => {
    // Datos de ejemplo - reemplazar con llamada real a la API
    const dummyRoutes: Route[] = [
      { 
        id: '1', 
        name: 'Ruta Centro - Norte', 
        description: 'Recorrido desde el centro hacia la zona norte', 
        stops: ['Terminal Central', 'Plaza Principal', 'Hospital General', 'Centro Comercial Norte'] 
      },
      { 
        id: '2', 
        name: 'Ruta Sur - Universidad', 
        description: 'Ruta hacia el campus universitario', 
        stops: ['Terminal Sur', 'Mercado Municipal', 'Parque Industrial', 'Campus Universitario'] 
      },
    ];
    setRoutes(dummyRoutes);

    // Simulación de autobuses (esto vendría de Socket.IO en producción)
    const dummyBuses: Bus[] = [
      {
        id: 'bus1',
        routeId: '1',
        routeName: 'Ruta Centro - Norte',
        occupancyPercentage: 75,
        location: { lat: 19.4326, lng: -99.1332 },
        nextStop: 'Hospital General'
      },
      {
        id: 'bus2',
        routeId: '1',
        routeName: 'Ruta Centro - Norte',
        occupancyPercentage: 45,
        location: { lat: 19.4300, lng: -99.1350 },
        nextStop: 'Plaza Principal'
      },
      {
        id: 'bus3',
        routeId: '2',
        routeName: 'Ruta Sur - Universidad',
        occupancyPercentage: 90,
        location: { lat: 19.4200, lng: -99.1400 },
        nextStop: 'Parque Industrial'
      }
    ];
    setBuses(dummyBuses);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica real de autenticación con JWT
    setIsLoggedIn(true);
    setIsDriver(username.includes('driver')); // Simulación simple
    setIsAdmin(username.includes('admin')); // Simulación simple para acceso administrativo
  };

  const filteredBuses = selectedRoute 
    ? buses.filter(bus => bus.routeId === selectedRoute)
    : buses;

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <h1>TransporteApp</h1>
        <form onSubmit={handleLogin} className="login-form">
          <h2>Iniciar Sesión</h2>
          <div className="form-group">
            <label>Usuario:</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Ingresar</button>
          <p className="login-hint">Tip: Para probar como conductor, usa un nombre que incluya "driver"</p>
          <p className="login-hint">Para probar como administrador, usa un nombre que incluya "admin"</p>
        </form>
      </div>
    );
  }

  const renderContent = () => {
    if (isAdmin) {
      switch (activeView) {
        case 'routes':
          return <RouteManager token={token} />;
        case 'analytics':
          return <DataAnalytics token={token} />;
        default:
          return (
            <div className="admin-dashboard">
              <h2>Panel de Administración</h2>
              <div className="admin-cards">
                <div className="admin-card" onClick={() => setActiveView('routes')}>
                  <h3>Gestión de Rutas</h3>
                  <p>Crear, editar y eliminar rutas de transporte</p>
                </div>
                <div className="admin-card" onClick={() => setActiveView('analytics')}>
                  <h3>Analítica de Datos</h3>
                  <p>Visualizar estadísticas y reportes de uso</p>
                </div>
              </div>
              
              <div className="system-overview">
                <h3>Resumen del Sistema</h3>
                <div className="stats-overview">
                  <div className="stat-box">
                    <span className="stat-value">{routes.length}</span>
                    <span className="stat-label">Rutas Activas</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{buses.length}</span>
                    <span className="stat-label">Unidades</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">72%</span>
                    <span className="stat-label">Ocupación Promedio</span>
                  </div>
                </div>
              </div>
            </div>
          );
      }
    }
    
    if (isDriver) {
      return (
        <div className="driver-dashboard">
          <h2>Panel de Conductor</h2>
          <div className="route-selector">
            <label>Selecciona tu ruta:</label>
            <select 
              value={selectedRoute || ''} 
              onChange={(e) => setSelectedRoute(e.target.value)}
            >
              <option value="">Selecciona una ruta</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>{route.name}</option>
              ))}
            </select>
          </div>
          
          {selectedRoute && (
            <div className="route-details">
              <h3>Detalles de Ruta</h3>
              <div className="route-map-placeholder">
                <p>Aquí se mostraría el mapa con OpenStreetMap y OSRM</p>
                <p>Ruta seleccionada: {routes.find(r => r.id === selectedRoute)?.name}</p>
              </div>
              <div className="route-stops">
                <h4>Paradas</h4>
                <ul>
                  {routes.find(r => r.id === selectedRoute)?.stops.map((stop, index) => (
                    <li key={index}>{stop}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Vista de pasajero
    return (
      <div className="passenger-dashboard">
        <h2>Buscar Rutas</h2>
        <div className="route-filter">
          <label>Filtrar por ruta:</label>
          <select 
            value={selectedRoute || ''} 
            onChange={(e) => setSelectedRoute(e.target.value || null)}
          >
            <option value="">Todas las rutas</option>
            {routes.map(route => (
              <option key={route.id} value={route.id}>{route.name}</option>
            ))}
          </select>
        </div>
        
        <div className="bus-list">
          <h3>Autobuses Disponibles</h3>
          {filteredBuses.length === 0 ? (
            <p>No hay autobuses disponibles en esta ruta.</p>
          ) : (
            filteredBuses.map(bus => (
              <div key={bus.id} className="bus-card">
                <h4>{bus.routeName} - Bus #{bus.id}</h4>
                <div className="occupancy-indicator">
                  <div 
                    className="occupancy-bar" 
                    style={{ 
                      width: `${bus.occupancyPercentage}%`,
                      backgroundColor: bus.occupancyPercentage > 80 
                        ? 'crimson' 
                        : bus.occupancyPercentage > 50 
                          ? 'orange' 
                          : 'green'
                    }}
                  />
                  <span>{bus.occupancyPercentage}% ocupado</span>
                </div>
                <p>Próxima parada: {bus.nextStop}</p>
              </div>
            ))
          )}
        </div>
        
        <div className="map-container">
          <h3>Mapa de Rutas</h3>
          <div className="map-placeholder">
            <p>Aquí se mostraría el mapa con OpenStreetMap</p>
            <p>Con ubicación en tiempo real de los autobuses</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>TransporteApp</h1>
        <div className="user-info">
          <span>
            {isAdmin ? 'Administrador' : isDriver ? 'Conductor' : 'Pasajero'}: {username}
          </span>
          <button onClick={() => setIsLoggedIn(false)}>Cerrar Sesión</button>
        </div>
      </header>

      {isAdmin && (
        <nav className="admin-nav">
          <button 
            className={activeView === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeView === 'routes' ? 'active' : ''} 
            onClick={() => setActiveView('routes')}
          >
            Gestión de Rutas
          </button>
          <button 
            className={activeView === 'analytics' ? 'active' : ''} 
            onClick={() => setActiveView('analytics')}
          >
            Analítica de Datos
          </button>
        </nav>
      )}

      <div className="app-content">
        {renderContent()}
      </div>
    </main>
  );
}
