
# UTASOFT Server

Backend para la aplicación de monitoreo de buses UTASOFT.

## Requisitos

- Node.js (v14 o superior)
- SQL Server

## Instalación

1. Instalar dependencias:

```
cd server
npm install
```

2. Configurar variables de entorno:

Crear un archivo `.env` en la carpeta `server` con el siguiente contenido:

```
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
DB_USER=sa
DB_PASSWORD=creatos1
DB_SERVER=DESKTOP-G2I28UV
DB_NAME=utasoft

# JWT
JWT_SECRET=your-secret-key-change-this

# MQTT (opcional)
MQTT_HOST=broker.emqx.io
MQTT_PORT=1883
MQTT_PROTOCOL=mqtt
MQTT_USERNAME=
MQTT_PASSWORD=
```

## Ejecución

```
npm start
```

Para desarrollo:

```
npm run dev
```

## API Endpoints

### Autenticación

- `POST /api/register` - Registro de usuario
- `POST /api/login` - Inicio de sesión
- `POST /api/verify-mfa` - Verificación de código MFA
- `POST /api/setup-mfa` - Configurar MFA
- `POST /api/toggle-mfa` - Activar/desactivar MFA
- `PUT /api/change-password` - Cambiar contraseña
- `GET /api/profile` - Obtener perfil del usuario
- `PUT /api/profile` - Actualizar perfil

### Usuarios (solo admin)

- `GET /api/users` - Listar usuarios

### Buses

- `GET /api/buses` - Listar buses
- `GET /api/buses/:id` - Obtener un bus específico
- `POST /api/buses` - Crear bus (admin)
- `PUT /api/buses/:id` - Actualizar bus (admin)
- `DELETE /api/buses/:id` - Eliminar bus (admin)
- `PUT /api/buses/:id/passenger-count` - Actualizar contador de pasajeros
- `GET /api/buses/:id/occupancy-logs` - Obtener logs de ocupación
- `GET /api/buses/:id/occupancy-stats` - Obtener estadísticas de ocupación
- `GET /api/buses/:id/hourly-stats/:date` - Obtener estadísticas por hora

### Rutas

- `GET /api/routes` - Listar rutas
- `GET /api/routes/:id` - Obtener una ruta específica
- `POST /api/routes` - Crear ruta (admin)
- `PUT /api/routes/:id` - Actualizar ruta (admin)
- `DELETE /api/routes/:id` - Eliminar ruta (admin)
- `POST /api/routes/:id/stops` - Añadir parada a ruta (admin)
- `PUT /api/routes/stops/:id` - Actualizar parada (admin)
- `DELETE /api/routes/stops/:id` - Eliminar parada (admin)

## Estructura de la Base de Datos

El script `scripts/create-database.sql` crea las siguientes tablas:

- `Users` - Usuarios del sistema
- `Routes` - Rutas de buses
- `RouteStops` - Paradas de rutas
- `Buses` - Flota de buses
- `OccupancyLogs` - Registros de ocupación de pasajeros

## Seguridad

- Contraseñas almacenadas con hash (bcrypt)
- Autenticación con JWT
- Opcional: MFA (Multi-Factor Authentication)
- Protección contra XSS con helmet
- Rate limiting para prevenir ataques de fuerza bruta
