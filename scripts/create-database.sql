-- Crear base de datos
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'utasoft')
BEGIN
    CREATE DATABASE utasoft;
END
GO

USE utasoft;
GO

-- Tabla de Rutas
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Routes]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Routes](
        [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [routeId] VARCHAR(50) NOT NULL UNIQUE,
        [name] VARCHAR(100) NOT NULL,
        [description] TEXT NULL,
        [active] BIT NOT NULL DEFAULT 1,
        [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla Routes creada.'
END
ELSE
BEGIN
    PRINT 'Tabla Routes ya existe.'
END

-- Tabla de Paradas de Ruta
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RouteStops]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[RouteStops](
        [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [routeId] INT NOT NULL,
        [name] VARCHAR(100) NOT NULL,
        [lat] FLOAT NOT NULL,
        [lng] FLOAT NOT NULL,
        [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [FK_RouteStops_Routes] FOREIGN KEY([routeId]) REFERENCES [dbo].[Routes]([id]) ON DELETE CASCADE
    );
    PRINT 'Tabla RouteStops creada.'
END
ELSE
BEGIN
    PRINT 'Tabla RouteStops ya existe.'
END

-- Tabla de Buses
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Buses]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Buses](
        [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [busId] VARCHAR(50) NOT NULL UNIQUE,
        [routeId] INT NULL,
        [driverId] INT NULL,
        [licensePlate] VARCHAR(20) NOT NULL,
        [model] VARCHAR(50) NULL,
        [capacity] INT NOT NULL DEFAULT 0,
        [status] VARCHAR(20) NOT NULL DEFAULT 'inactive',
        [active] BIT NOT NULL DEFAULT 1,
        [currentLocation] GEOGRAPHY NULL,
        [lastPing] DATETIME NULL,
        [currentPassengers] INT NOT NULL DEFAULT 0,
        [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [FK_Buses_Routes] FOREIGN KEY([routeId]) REFERENCES [dbo].[Routes]([id])
    );
    PRINT 'Tabla Buses creada.'
END
ELSE
BEGIN
    PRINT 'Tabla Buses ya existe.'
END

-- Tabla de Usuarios
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Users](
        [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [username] VARCHAR(50) NOT NULL UNIQUE,
        [password] VARCHAR(255) NOT NULL,
        [email] VARCHAR(100) NULL UNIQUE,
        [fullName] VARCHAR(100) NULL,
        [role] VARCHAR(20) NOT NULL DEFAULT 'user',
        [active] BIT NOT NULL DEFAULT 1,
        [mfaSecret] VARCHAR(255) NULL,
        [mfaEnabled] BIT NOT NULL DEFAULT 0,
        [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla Users creada.'
END
ELSE
BEGIN
    PRINT 'Tabla Users ya existe.'
END

-- Tabla de Logs de Ocupación
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[OccupancyLogs]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[OccupancyLogs](
        [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [busId] INT NOT NULL,
        [timestamp] DATETIME NOT NULL DEFAULT GETDATE(),
        [passengerCount] INT NOT NULL,
        [latitude] FLOAT NULL,
        [longitude] FLOAT NULL,
        [location] GEOGRAPHY NULL,
        CONSTRAINT [FK_OccupancyLogs_Buses] FOREIGN KEY([busId]) REFERENCES [dbo].[Buses]([id])
    );
    PRINT 'Tabla OccupancyLogs creada.'
END
ELSE
BEGIN
    PRINT 'Tabla OccupancyLogs ya existe.'
END

-- Insertar usuario administrador por defecto si no existe
IF NOT EXISTS (SELECT * FROM [dbo].[Users] WHERE [username] = 'admin')
BEGIN
    INSERT INTO [dbo].[Users] ([username], [password], [email], [fullName], [role])
    VALUES ('admin', '$2b$10$x5S5FNQ9wLBBbF.KPiR/7.GTG/Ko8kgXjGTAEWOpyAtUJA7RN5ad6', 'admin@ibamex.com', 'Administrador', 'admin')
    PRINT 'Usuario admin creado con contraseña: password123'
END
ELSE
BEGIN
    PRINT 'Usuario admin ya existe.'
END

-- Crear tabla VerificationCodes
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VerificationCodes]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[VerificationCodes](
        [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [email] NVARCHAR(255) NOT NULL,
        [code] NVARCHAR(6) NOT NULL,
        [createdAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla VerificationCodes creada.'
END
ELSE
BEGIN
    PRINT 'Tabla VerificationCodes ya existe.'
END

-- Crear índices para la tabla VerificationCodes
CREATE INDEX idx_email ON [dbo].[VerificationCodes] (email);
CREATE INDEX idx_created_at ON [dbo].[VerificationCodes] (createdAt);

-- Crear procedimiento almacenado para limpiar códigos expirados
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CleanupExpiredCodes]') AND type = 'P')
BEGIN
    EXEC('
    CREATE PROCEDURE CleanupExpiredCodes
    AS
    BEGIN
        DELETE FROM [dbo].[VerificationCodes] 
        WHERE createdAt < DATEADD(MINUTE, -10, GETDATE());
    END;
    ');
    PRINT 'Procedimiento CleanupExpiredCodes creado.'
END
ELSE
BEGIN
    PRINT 'Procedimiento CleanupExpiredCodes ya existe.'
END
GO