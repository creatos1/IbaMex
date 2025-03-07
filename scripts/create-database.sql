
-- Crear tablas
CREATE TABLE IF NOT EXISTS Users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(200) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  mfaEnabled BOOLEAN DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Routes (
  id SERIAL PRIMARY KEY,
  routeId VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS RouteStops (
  id SERIAL PRIMARY KEY,
  routeId INT REFERENCES Routes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL
);

CREATE TABLE IF NOT EXISTS Buses (
  id SERIAL PRIMARY KEY,
  busId VARCHAR(50) NOT NULL UNIQUE,
  routeId INT REFERENCES Routes(id),
  capacity INT DEFAULT 40,
  currentOccupancy INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  batteryLevel INT DEFAULT 100,
  lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS OccupancyLogs (
  id SERIAL PRIMARY KEY,
  busId INT REFERENCES Buses(id),
  routeId INT REFERENCES Routes(id),
  count INT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de prueba
-- Usuarios
INSERT INTO Users (username, email, password, role, mfaEnabled, status)
VALUES 
  ('admin', 'admin@ibamex.com', '$2a$10$xJ8ab/TyRYhSQVg7HvgM6.eHRFLBOpS2RVe5CvN9xgV1YDQNz3vU2', 'admin', false, 'active'),
  ('usuario', 'usuario@ibamex.com', '$2a$10$xJ8ab/TyRYhSQVg7HvgM6.eHRFLBOpS2RVe5CvN9xgV1YDQNz3vU2', 'user', false, 'active'),
  ('chofer', 'chofer@ibamex.com', '$2a$10$xJ8ab/TyRYhSQVg7HvgM6.eHRFLBOpS2RVe5CvN9xgV1YDQNz3vU2', 'driver', false, 'active');

-- Rutas
INSERT INTO Routes (routeId, name, description, active)
VALUES 
  ('ROUTE1', 'Ruta Centro - Norte', 'Ruta que conecta el centro con la zona norte', true),
  ('ROUTE2', 'Ruta Este - Oeste', 'Ruta que conecta el este con el oeste', true);

-- Paradas
INSERT INTO RouteStops (routeId, name, lat, lng)
VALUES 
  (1, 'Centro', 19.432608, -99.133209),
  (1, 'Reforma', 19.428470, -99.152404),
  (1, 'Chapultepec', 19.420388, -99.175879),
  (1, 'Polanco', 19.431837, -99.199568),
  (2, 'Terminal Este', 19.445233, -99.100294),
  (2, 'Insurgentes', 19.423738, -99.163419),
  (2, 'Terminal Oeste', 19.406367, -99.210367);

-- Buses
INSERT INTO Buses (busId, routeId, capacity, currentOccupancy, status, batteryLevel)
VALUES 
  ('BUS001', 1, 45, 12, 'active', 85),
  ('BUS002', 1, 40, 5, 'active', 92),
  ('BUS003', 2, 35, 20, 'active', 78);

-- Logs de ocupación (para las últimas 24 horas)
DO $$
DECLARE
  i INTEGER;
  timestamp_val TIMESTAMP;
BEGIN
  FOR i IN 0..23 LOOP
    timestamp_val := NOW() - (i * INTERVAL '1 HOUR');
    
    -- Bus 1
    INSERT INTO OccupancyLogs (busId, routeId, count, timestamp)
    VALUES (1, 1, FLOOR(RANDOM() * 30) + 5, timestamp_val);
    
    -- Bus 2
    INSERT INTO OccupancyLogs (busId, routeId, count, timestamp)
    VALUES (2, 1, FLOOR(RANDOM() * 20) + 2, timestamp_val);
    
    -- Bus 3
    INSERT INTO OccupancyLogs (busId, routeId, count, timestamp)
    VALUES (3, 2, FLOOR(RANDOM() * 25) + 10, timestamp_val);
  END LOOP;
END $$;
