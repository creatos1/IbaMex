
const { pool } = require('../config/db');

class Route {
  // Obtener todas las rutas
  static async findAll() {
    try {
      const result = await pool.query('SELECT * FROM Routes WHERE active = true');
      
      // Obtener las paradas para cada ruta
      const routes = await Promise.all(result.rows.map(async (route) => {
        const stopsResult = await pool.query('SELECT * FROM RouteStops WHERE routeId = $1', [route.id]);
        
        // Formatear las paradas en el formato esperado
        const stops = stopsResult.rows.map(stop => ({
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
      const result = await pool.query('SELECT * FROM Routes WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const route = result.rows[0];
      
      // Obtener las paradas
      const stopsResult = await pool.query('SELECT * FROM RouteStops WHERE routeId = $1', [route.id]);
      
      // Formatear las paradas
      const stops = stopsResult.rows.map(stop => ({
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
      const result = await pool.query('SELECT * FROM Routes WHERE routeId = $1', [routeId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const route = result.rows[0];
      
      // Obtener las paradas
      const stopsResult = await pool.query('SELECT * FROM RouteStops WHERE routeId = $1', [route.id]);
      
      // Formatear las paradas
      const stops = stopsResult.rows.map(stop => ({
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
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { routeId, name, description = '', stops = [], active = true } = routeData;
      
      // Insertar la ruta principal
      const routeResult = await client.query(
        'INSERT INTO Routes (routeId, name, description, active) VALUES ($1, $2, $3, $4) RETURNING *',
        [routeId, name, description, active]
      );
      
      const newRoute = routeResult.rows[0];
      
      // Insertar las paradas
      if (stops && stops.length > 0) {
        for (const stop of stops) {
          await client.query(
            'INSERT INTO RouteStops (routeId, name, lat, lng) VALUES ($1, $2, $3, $4)',
            [newRoute.id, stop.name, stop.location.lat, stop.location.lng]
          );
        }
      }
      
      await client.query('COMMIT');
      
      // Obtener la ruta completa con paradas
      return await Route.findById(newRoute.id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear ruta:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Actualizar ruta
  static async update(id, updateData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { name, description, stops, active } = updateData;
      
      // Actualizar datos básicos de la ruta
      if (name || description !== undefined || active !== undefined) {
        const updateFields = [];
        const updateValues = [];
        let valueIndex = 1;
        
        if (name) {
          updateFields.push(`name = $${valueIndex}`);
          updateValues.push(name);
          valueIndex++;
        }
        
        if (description !== undefined) {
          updateFields.push(`description = $${valueIndex}`);
          updateValues.push(description);
          valueIndex++;
        }
        
        if (active !== undefined) {
          updateFields.push(`active = $${valueIndex}`);
          updateValues.push(active);
          valueIndex++;
        }
        
        if (updateFields.length > 0) {
          const updateQuery = `UPDATE Routes SET ${updateFields.join(', ')} WHERE id = $${valueIndex} RETURNING *`;
          await client.query(updateQuery, [...updateValues, id]);
        }
      }
      
      // Actualizar paradas si se proporcionan
      if (stops) {
        // Eliminar paradas existentes
        await client.query('DELETE FROM RouteStops WHERE routeId = $1', [id]);
        
        // Insertar nuevas paradas
        for (const stop of stops) {
          await client.query(
            'INSERT INTO RouteStops (routeId, name, lat, lng) VALUES ($1, $2, $3, $4)',
            [id, stop.name, stop.location.lat, stop.location.lng]
          );
        }
      }
      
      await client.query('COMMIT');
      
      // Obtener la ruta actualizada
      return await Route.findById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al actualizar ruta:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Eliminar ruta
  static async delete(id) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Eliminar paradas asociadas
      await client.query('DELETE FROM RouteStops WHERE routeId = $1', [id]);
      
      // Eliminar la ruta
      const result = await client.query('DELETE FROM Routes WHERE id = $1 RETURNING *', [id]);
      
      await client.query('COMMIT');
      
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al eliminar ruta:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Route;
