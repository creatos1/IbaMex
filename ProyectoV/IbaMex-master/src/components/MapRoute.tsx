
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import '../styles/MapRoute.css';

// Necesario para que los íconos de Leaflet funcionen correctamente
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapRouteProps {
  editable?: boolean;
  existingRoute?: {
    id: string;
    name: string;
    waypoints: [number, number][];
  };
  onRouteCreated?: (waypoints: [number, number][]) => void;
}

export default function MapRoute({ editable = false, existingRoute, onRouteCreated }: MapRouteProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [waypoints, setWaypoints] = useState<L.LatLng[]>([]);
  const [mode, setMode] = useState<'routing' | 'custom'>('routing');
  const [customPoints, setCustomPoints] = useState<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Inicializar el mapa si no existe
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([19.432608, -99.133209], 13); // Ciudad de México como centro por defecto

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Crear una capa para los marcadores personalizados
      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Si tenemos ruta existente, la cargamos
    if (existingRoute && existingRoute.waypoints.length > 0) {
      const routeWaypoints = existingRoute.waypoints.map(wp => L.latLng(wp[0], wp[1]));
      setWaypoints(routeWaypoints);
      
      if (mode === 'routing') {
        routingControlRef.current = L.Routing.control({
          waypoints: routeWaypoints,
          routeWhileDragging: true,
          lineOptions: {
            styles: [{ color: '#2196F3', weight: 5 }]
          },
          showAlternatives: false,
          addWaypoints: editable,
          draggableWaypoints: editable
        }).addTo(map);
      }
    } else if (editable && mode === 'routing') {
      // Iniciar con waypoints vacíos si es editable y no hay ruta existente
      routingControlRef.current = L.Routing.control({
        waypoints: [],
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: '#2196F3', weight: 5 }]
        },
        showAlternatives: false,
        addWaypoints: true,
        draggableWaypoints: true
      }).addTo(map);
    }

    // Función para añadir puntos personalizados
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!editable) return;
      
      if (mode === 'routing') {
        // Este modo ya está manejado por el routing control
        return;
      }
      
      if (mode === 'custom' && markersLayerRef.current) {
        const marker = L.marker(e.latlng, {
          draggable: true,
          title: `Punto ${customPoints.length + 1}`
        });
        
        // Popup para el marcador con botón para eliminar
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
          <div>
            <p>Punto ${customPoints.length + 1}</p>
            <p>Lat: ${e.latlng.lat.toFixed(6)}, Lng: ${e.latlng.lng.toFixed(6)}</p>
            <button class="delete-marker-btn">Eliminar</button>
          </div>
        `;
        
        const popup = L.popup().setContent(popupContent);
        marker.bindPopup(popup);
        
        marker.on('dragend', updateCustomPoints);
        
        // Agregar evento al botón eliminar
        setTimeout(() => {
          const deleteBtn = popupContent.querySelector('.delete-marker-btn');
          if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
              marker.remove();
              updateCustomPoints();
            });
          }
        }, 0);
        
        marker.addTo(markersLayerRef.current);
        setCustomPoints(prev => [...prev, marker]);
        
        // Llamar a onRouteCreated si existe
        updateCustomPoints();
      }
    };

    const updateCustomPoints = () => {
      const points = markersLayerRef.current?.getLayers() || [];
      const validPoints = points
        .filter(layer => layer instanceof L.Marker)
        .map(layer => (layer as L.Marker).getLatLng());
      
      if (onRouteCreated && mode === 'custom') {
        onRouteCreated(validPoints.map(point => [point.lat, point.lng] as [number, number]));
      }
    };

    // Añadir evento de clic
    map.on('click', handleMapClick);

    // Manejo de waypoints en modo routing
    if (editable && mode === 'routing' && routingControlRef.current) {
      routingControlRef.current.on('routeselected', function(e) {
        const routeWaypoints = routingControlRef.current?.getWaypoints() || [];
        const validWaypoints = routeWaypoints
          .filter(wp => wp.latLng !== null && wp.latLng !== undefined)
          .map(wp => wp.latLng!);
        
        setWaypoints(validWaypoints);
        
        if (onRouteCreated) {
          onRouteCreated(validWaypoints.map(wp => [wp.lat, wp.lng] as [number, number]));
        }
      });
    }

    return () => {
      map.off('click', handleMapClick);
      
      if (routingControlRef.current && map.hasLayer(routingControlRef.current)) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [editable, existingRoute, onRouteCreated, mode, customPoints.length]);

  // Limpiar el mapa al desmontar
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Cambiar entre modo de ruta y puntos personalizados
  const toggleMode = () => {
    const newMode = mode === 'routing' ? 'custom' : 'routing';
    setMode(newMode);
    
    const map = mapInstanceRef.current;
    if (!map) return;
    
    // Limpiar el mapa actual
    if (routingControlRef.current && map.hasLayer(routingControlRef.current)) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
      setCustomPoints([]);
    }
    
    // Configurar el nuevo modo
    if (newMode === 'routing' && editable) {
      routingControlRef.current = L.Routing.control({
        waypoints: [],
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: '#2196F3', weight: 5 }]
        },
        showAlternatives: false,
        addWaypoints: true,
        draggableWaypoints: true
      }).addTo(map);
    }
  };

  return (
    <div className="map-container">
      <div ref={mapRef} className="map-view"></div>
      {editable && (
        <div className="map-controls">
          <div className="mode-toggle">
            <button 
              className={`mode-btn ${mode === 'routing' ? 'active' : ''}`} 
              onClick={() => mode !== 'routing' && toggleMode()}
            >
              Modo Ruta
            </button>
            <button 
              className={`mode-btn ${mode === 'custom' ? 'active' : ''}`} 
              onClick={() => mode !== 'custom' && toggleMode()}
            >
              Puntos Personalizados
            </button>
          </div>
          <div className="map-instructions">
            {mode === 'routing' ? (
              <p>Haga clic en el mapa para añadir puntos a la ruta</p>
            ) : (
              <p>Haga clic para añadir puntos personalizados. Arrastre para moverlos.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
