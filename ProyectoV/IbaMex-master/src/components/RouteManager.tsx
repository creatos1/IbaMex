import { useState, useEffect } from 'react';
import MapRoute from './MapRoute';
import '../styles/RouteManager.css';

interface Route {
  id: string;
  name: string;
  description: string;
  stops: string[];
  waypoints: [number, number][];
}

interface RouteManagerProps {
  token: string;
}

export default function RouteManager({ token }: RouteManagerProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newRoute, setNewRoute] = useState({
    name: '',
    description: '',
    waypoints: [] as [number, number][] //Added waypoints to newRoute state
  });
  const [stops, setStops] = useState<string[]>(['']);
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  // Función para cargar las rutas existentes (simulada)
  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      // Simulación de API - en producción esto sería una llamada real
      setTimeout(() => {
        const dummyRoutes: Route[] = [
          { 
            id: '1', 
            name: 'Ruta Centro - Norte', 
            description: 'Recorrido desde el centro hacia la zona norte', 
            stops: ['Terminal Central', 'Plaza Principal', 'Hospital General', 'Centro Comercial Norte'],
            waypoints: [
              [19.435, -99.130],
              [19.440, -99.135],
              [19.445, -99.140],
              [19.450, -99.145]
            ]
          },
          { 
            id: '2', 
            name: 'Ruta Sur - Universidad', 
            description: 'Ruta hacia el campus universitario', 
            stops: ['Terminal Sur', 'Mercado Municipal', 'Parque Industrial', 'Campus Universitario'],
            waypoints: [
              [19.425, -99.140],
              [19.420, -99.145],
              [19.415, -99.150],
              [19.410, -99.155]
            ]
          },
        ];
        setRoutes(dummyRoutes);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Error al cargar las rutas');
      setIsLoading(false);
    }
  };

  // Cargar rutas al montar el componente
  useEffect(() => {
    fetchRoutes();
  }, []);

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRoute((prev) => ({ ...prev, [name]: value }));
  };

  // Añadir nueva parada
  const addStop = () => {
    setStops([...stops, '']);
  };

  // Actualizar parada
  const updateStop = (index: number, value: string) => {
    const updatedStops = [...stops];
    updatedStops[index] = value;
    setStops(updatedStops);
  };

  // Eliminar parada
  const removeStop = (index: number) => {
    const updatedStops = [...stops];
    updatedStops.splice(index, 1);
    setStops(updatedStops);
  };

  // Manejar ruta creada desde el mapa
  const handleRouteCreated = (newWaypoints: [number, number][]) => {
    setNewRoute(prev => ({...prev, waypoints: newWaypoints})); //Update waypoints in newRoute state
    console.log("Route waypoints updated:", newWaypoints);
  };

  // Enviar el formulario para crear una nueva ruta
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validar que haya al menos 2 waypoints
    if (newRoute.waypoints.length < 2) { // Use newRoute.waypoints for validation
      setError('La ruta debe tener al menos 2 puntos en el mapa');
      setIsLoading(false);
      return;
    }

    // Simulación de API - en producción esto sería una llamada real
    setTimeout(() => {
      const newRouteData: Route = {
        id: Date.now().toString(), // Generar un ID único (en producción sería asignado por el backend)
        name: newRoute.name,
        description: newRoute.description,
        stops: stops.filter(stop => stop.trim() !== ''),
        waypoints: newRoute.waypoints // Use waypoints from newRoute state
      };

      setRoutes([...routes, newRouteData]);

      // Resetear el formulario
      setNewRoute({ name: '', description: '', waypoints: []}); //Reset waypoints
      setStops(['']);
      setWaypoints([]);

      setIsLoading(false);
    }, 1000);
  };

  // Mostrar detalles de una ruta seleccionada
  const handleViewRoute = (routeId: string) => {
    setSelectedRouteId(selectedRouteId === routeId ? null : routeId);
  };

  const selectedRoute = routes.find(r => r.id === selectedRouteId);

  return (
    <div className="route-manager">
      <h2>Gestión de Rutas</h2>

      <div className="route-form-container">
        <h3>Crear Nueva Ruta</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="route-form">
          <div className="form-group">
            <label>Nombre de la Ruta:</label>
            <input 
              type="text" 
              name="name" 
              value={newRoute.name} 
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción:</label>
            <textarea 
              name="description" 
              value={newRoute.description} 
              onChange={handleInputChange}
              rows={3}
              required
            />
          </div>

          <div className="form-group map-creator">
            <label>Trazar Ruta en el Mapa:</label>
            <MapRoute 
              editable={true} 
              onRouteCreated={handleRouteCreated}
            />
          </div>

          <div className="form-group">
            <label>Paradas:</label>
            {stops.map((stop, index) => (
              <div key={index} className="stop-input">
                <input 
                  type="text"
                  value={stop}
                  onChange={(e) => updateStop(index, e.target.value)}
                  placeholder={`Parada ${index + 1}`}
                  required
                />
                {stops.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-btn" 
                    onClick={() => removeStop(index)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              className="add-btn" 
              onClick={addStop}
            >
              Añadir Parada
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="submit-btn"
          >
            {isLoading ? 'Creando...' : 'Crear Ruta'}
          </button>
        </form>
      </div>

      <div className="routes-list">
        <h3>Rutas Existentes</h3>
        {isLoading && !routes.length ? (
          <p>Cargando rutas...</p>
        ) : routes.length === 0 ? (
          <p>No hay rutas registradas</p>
        ) : (
          <div className="routes-grid">
            {routes.map(route => (
              <div key={route.id} className="route-card">
                <h4>{route.name}</h4>
                <p>{route.description}</p>
                <div className="card-actions">
                  <button 
                    className="view-route-btn" 
                    onClick={() => handleViewRoute(route.id)}
                  >
                    {selectedRouteId === route.id ? 'Ocultar Mapa' : 'Ver en Mapa'}
                  </button>
                </div>

                {selectedRouteId === route.id && (
                  <div className="route-map">
                    <MapRoute 
                      editable={false}
                      existingRoute={{
                        id: route.id,
                        name: route.name,
                        waypoints: route.waypoints
                      }}
                    />
                  </div>
                )}

                <div className="stops-list">
                  <strong>Paradas:</strong>
                  <ol>
                    {route.stops.map((stop, index) => (
                      <li key={index}>{stop}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}