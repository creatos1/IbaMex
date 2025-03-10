
const { pool, sql } = require('../config/db');

class Route {
  // Obtener todas las rutas
  static async findAll() {
    try {
      const result = await pool.request()
        .query('SELECT * FROM Routes WHERE active = 1');
      
      // Obtener las paradas para cada ruta
      const routes = await Promise.all(result.recordset.map(async (route) => {
        const stopsResult = await pool.request()
          .input('routeId', sql.Int, route.id)
          .query('SELECT * FROM RouteStops WHERE routeId = @routeId');
        
        // Formatear las paradas en el formato esperado
        const stops = stopsResult.recordset.map(stop => ({
          name: stop.name,
          location: {
            lat: parseFloat(stop.lat),
            lng: parseFloat(stop.lng)
          }
        }));
        
        return { ...route, stops };
      }));
      
      return routes;
    } catch (error) {
      console.error('Error al obtener rutas:', error);
      throw error;
    }
  }

  // Buscar ruta por ID
  static async findById(id) {
    try {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Routes WHERE id = @id');
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      const route = result.recordset[0];
      
      // Obtener las paradas
      const stopsResult = await pool.request()
        .input('routeId', sql.Int, route.id)
        .query('SELECT * FROM RouteStops WHERE routeId = @routeId');
      
      // Formatear las paradas
      const stops = stopsResult.recordset.map(stop => ({
        name: stop.name,
        location: {
          lat: parseFloat(stop.lat),
          lng: parseFloat(stop.lng)
        }
      }));
      
      return { ...route, stops };
    } catch (error) {
      console.error('Error al buscar ruta por ID:', error);
      throw error;
    }
  }

  // Buscar ruta por routeId
  static async findByRouteId(routeId) {
    try {
      const result = await pool.request()
        .input('routeId', sql.VarChar, routeId)
        .query('SELECT * FROM Routes WHERE routeId = @routeId');
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      const route = result.recordset[0];
      
      // Obtener las paradas
      const stopsResult = await pool.request()
        .input('routeId', sql.Int, route.id)
        .query('SELECT * FROM RouteStops WHERE routeId = @routeId');
      
      // Formatear las paradas
      const stops = stopsResult.recordset.map(stop => ({
        name: stop.name,
        location: {
          lat: parseFloat(stop.lat),
          lng: parseFloat(stop.lng)
        }
      }));
      
      return { ...route, stops };
    } catch (error) {
      console.error('Error al buscar ruta por routeId:', error);
      throw error;
    }
  }

  // Crear una nueva ruta
  static async create(routeData) {
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      const { routeId, name, description = '', stops = [], waypoints = [], active = true } = routeData;
      
      // Insertar la ruta principal
      const routeResult = await new sql.Request(transaction)
        .input('routeId', sql.VarChar, routeId)
        .input('name', sql.VarChar, name)
        .input('description', sql.VarChar, description)
        .input('active', sql.Bit, active)
        .query('INSERT INTO Routes (routeId, name, description, active) OUTPUT INSERTED.* VALUES (@routeId, @name, @description, @active)');
      
      const newRoute = routeResult.recordset[0];
      
      // Insertar las paradas
      if (stops && stops.length > 0) {
        for (const stop of stops) {
          await new sql.Request(transaction)
            .input('routeId', sql.Int, newRoute.id)
            .input('name', sql.VarChar, stop.name)
            .input('lat', sql.Float, stop.location.lat)
            .input('lng', sql.Float, stop.location.lng)
            .query('INSERT INTO RouteStops (routeId, name, lat, lng) VALUES (@routeId, @name, @lat, @lng)');
        }
      }
      
      // Insertar los waypoints si existen
      if (waypoints && waypoints.length > 0) {
        let order = 0;
        for (const point of waypoints) {
          await new sql.Request(transaction)
            .input('routeId', sql.Int, newRoute.id)
            .input('lat', sql.Float, point[0])
            .input('lng', sql.Float, point[1])
            .input('order', sql.Int, order++)
            .query('INSERT INTO RouteWaypoints (routeId, lat, lng, pointOrder) VALUES (@routeId, @lat, @lng, @order)');
        }
      }
      
      await transaction.commit();
      
      // Obtener la ruta completa con paradas
      return await Route.findById(newRoute.id);
    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear ruta:', error);
      throw error;
    }
  }

  // Actualizar ruta
  static async update(id, updateData) {
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      const { name, description, stops, waypoints, active } = updateData;
      
      // Actualizar datos básicos de la ruta
      if (name || description !== undefined || active !== undefined) {
        const request = new sql.Request(transaction);
        let updateQuery = 'UPDATE Routes SET ';
        const updateParts = [];
        
        if (name) {
          request.input('name', sql.VarChar, name);
          updateParts.push('name = @name');
        }
        
        if (description !== undefined) {
          request.input('description', sql.VarChar, description);
          updateParts.push('description = @description');
        }
        
        if (active !== undefined) {
          request.input('active', sql.Bit, active);
          updateParts.push('active = @active');
        }
        
        updateQuery += updateParts.join(', ') + ' WHERE id = @id';
        request.input('id', sql.Int, id);
        
        await request.query(updateQuery);
      }
      
      // Actualizar paradas si se proporcionan
      if (stops) {
        // Eliminar paradas existentes
        await new sql.Request(transaction)
          .input('routeId', sql.Int, id)
          .query('DELETE FROM RouteStops WHERE routeId = @routeId');
        
        // Insertar nuevas paradas
        for (const stop of stops) {
          await new sql.Request(transaction)
            .input('routeId', sql.Int, id)
            .input('name', sql.VarChar, stop.name)
            .input('lat', sql.Float, stop.location.lat)
            .input('lng', sql.Float, stop.location.lng)
            .query('INSERT INTO RouteStops (routeId, name, lat, lng) VALUES (@routeId, @name, @lat, @lng)');
        }
      }
      
      // Actualizar waypoints si se proporcionan
      if (waypoints) {
        // Eliminar waypoints existentes
        await new sql.Request(transaction)
          .input('routeId', sql.Int, id)
          .query('DELETE FROM RouteWaypoints WHERE routeId = @routeId');
        
        // Insertar nuevos waypoints
        let order = 0;
        for (const point of waypoints) {
          await new sql.Request(transaction)
            .input('routeId', sql.Int, id)
            .input('lat', sql.Float, point[0])
            .input('lng', sql.Float, point[1])
            .input('order', sql.Int, order++)
            .query('INSERT INTO RouteWaypoints (routeId, lat, lng, pointOrder) VALUES (@routeId, @lat, @lng, @order)');
        }
      }
      
      await transaction.commit();
      
      // Obtener la ruta actualizada
      return await Route.findById(id);
    } catch (error) {
      await transaction.rollback();
      console.error('Error al actualizar ruta:', error);
      throw error;
    }
  }

  // Eliminar ruta
  static async delete(id) {
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      // Eliminar paradas asociadas
      await new sql.Request(transaction)
        .input('routeId', sql.Int, id)
        .query('DELETE FROM RouteStops WHERE routeId = @routeId');
      
      // Eliminar waypoints asociados
      await new sql.Request(transaction)
        .input('routeId', sql.Int, id)
        .query('DELETE FROM RouteWaypoints WHERE routeId = @routeId');
      
      // Eliminar la ruta
      const result = await new sql.Request(transaction)
        .input('id', sql.Int, id)
        .query('DELETE FROM Routes WHERE id = @id OUTPUT DELETED.*');
      
      await transaction.commit();
      
      return result.recordset[0];
    } catch (error) {
      await transaction.rollback();
      console.error('Error al eliminar ruta:', error);
      throw error;
    }
  }
}

module.exports = Route;
