
const sql = require('mssql');

class RouteModel {
  constructor(connection) {
    this.sql = connection;
  }

  async create(routeData) {
    try {
      const result = await this.sql.request()
        .input('routeId', sql.VarChar, routeData.routeId)
        .input('name', sql.VarChar, routeData.name)
        .input('description', sql.Text, routeData.description || null)
        .input('active', sql.Bit, routeData.active !== undefined ? routeData.active : 1)
        .query(`
          INSERT INTO Routes (routeId, name, description, active)
          VALUES (@routeId, @name, @description, @active);
          SELECT SCOPE_IDENTITY() AS id
        `);
      
      const routeId = result.recordset[0].id;
      
      // Si hay paradas definidas, crearlas
      if (routeData.stops && Array.isArray(routeData.stops) && routeData.stops.length > 0) {
        for (const stop of routeData.stops) {
          await this.sql.request()
            .input('routeId', sql.Int, routeId)
            .input('name', sql.VarChar, stop.name)
            .input('lat', sql.Float, stop.lat)
            .input('lng', sql.Float, stop.lng)
            .query(`
              INSERT INTO RouteStops (routeId, name, lat, lng)
              VALUES (@routeId, @name, @lat, @lng)
            `);
        }
      }
      
      return routeId;
    } catch (err) {
      console.error('Error creating route:', err);
      throw err;
    }
  }

  async findById(id) {
    try {
      // Obtener la ruta principal
      const routeResult = await this.sql.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Routes WHERE id = @id');
      
      if (routeResult.recordset.length === 0) {
        return null;
      }
      
      const route = routeResult.recordset[0];
      
      // Obtener las paradas asociadas
      const stopsResult = await this.sql.request()
        .input('routeId', sql.Int, id)
        .query('SELECT * FROM RouteStops WHERE routeId = @routeId ORDER BY id');
      
      route.stops = stopsResult.recordset;
      
      return route;
    } catch (err) {
      console.error('Error finding route by id:', err);
      throw err;
    }
  }

  async findByRouteId(routeId) {
    try {
      // Obtener la ruta principal
      const routeResult = await this.sql.request()
        .input('routeId', sql.VarChar, routeId)
        .query('SELECT * FROM Routes WHERE routeId = @routeId');
      
      if (routeResult.recordset.length === 0) {
        return null;
      }
      
      const route = routeResult.recordset[0];
      
      // Obtener las paradas asociadas
      const stopsResult = await this.sql.request()
        .input('routeId', sql.Int, route.id)
        .query('SELECT * FROM RouteStops WHERE routeId = @routeId ORDER BY id');
      
      route.stops = stopsResult.recordset;
      
      return route;
    } catch (err) {
      console.error('Error finding route by routeId:', err);
      throw err;
    }
  }

  async findAll(query = {}) {
    try {
      let sqlQuery = 'SELECT * FROM Routes WHERE 1=1';
      const request = this.sql.request();
      
      if (query.active !== undefined) {
        sqlQuery += ' AND active = @active';
        request.input('active', sql.Bit, query.active);
      }
      
      if (query.searchTerm) {
        sqlQuery += ' AND (name LIKE @search OR routeId LIKE @search OR description LIKE @search)';
        request.input('search', sql.VarChar, `%${query.searchTerm}%`);
      }
      
      sqlQuery += ' ORDER BY id DESC';
      
      const routesResult = await request.query(sqlQuery);
      const routes = routesResult.recordset;
      
      // Para cada ruta, obtener sus paradas
      for (const route of routes) {
        const stopsResult = await this.sql.request()
          .input('routeId', sql.Int, route.id)
          .query('SELECT * FROM RouteStops WHERE routeId = @routeId ORDER BY id');
        
        route.stops = stopsResult.recordset;
      }
      
      return routes;
    } catch (err) {
      console.error('Error finding routes:', err);
      throw err;
    }
  }

  async update(id, routeData) {
    try {
      // Iniciar transacción
      const transaction = new sql.Transaction(this.sql);
      await transaction.begin();
      
      try {
        // Actualizar datos principales de la ruta
        let sqlQuery = 'UPDATE Routes SET ';
        const request = new sql.Request(transaction);
        request.input('id', sql.Int, id);
        
        const updateFields = [];
        
        if (routeData.routeId) {
          updateFields.push('routeId = @routeId');
          request.input('routeId', sql.VarChar, routeData.routeId);
        }
        
        if (routeData.name) {
          updateFields.push('name = @name');
          request.input('name', sql.VarChar, routeData.name);
        }
        
        if (routeData.description !== undefined) {
          updateFields.push('description = @description');
          request.input('description', sql.Text, routeData.description);
        }
        
        if (routeData.active !== undefined) {
          updateFields.push('active = @active');
          request.input('active', sql.Bit, routeData.active);
        }
        
        updateFields.push('updatedAt = GETDATE()');
        
        if (updateFields.length > 0) {
          sqlQuery += updateFields.join(', ') + ' WHERE id = @id';
          await request.query(sqlQuery);
        }
        
        // Si se proveen paradas, actualizar paradas
        if (routeData.stops && Array.isArray(routeData.stops)) {
          // Eliminar paradas anteriores
          await new sql.Request(transaction)
            .input('routeId', sql.Int, id)
            .query('DELETE FROM RouteStops WHERE routeId = @routeId');
          
          // Insertar nuevas paradas
          for (const stop of routeData.stops) {
            await new sql.Request(transaction)
              .input('routeId', sql.Int, id)
              .input('name', sql.VarChar, stop.name)
              .input('lat', sql.Float, stop.lat)
              .input('lng', sql.Float, stop.lng)
              .query(`
                INSERT INTO RouteStops (routeId, name, lat, lng)
                VALUES (@routeId, @name, @lat, @lng)
              `);
          }
        }
        
        // Confirmar transacción
        await transaction.commit();
        return true;
      } catch (err) {
        // Revertir transacción en caso de error
        await transaction.rollback();
        console.error('Error updating route in transaction:', err);
        throw err;
      }
    } catch (err) {
      console.error('Error updating route:', err);
      throw err;
    }
  }

  async delete(id) {
    try {
      // Iniciar transacción
      const transaction = new sql.Transaction(this.sql);
      await transaction.begin();
      
      try {
        // Actualizar buses que usan esta ruta
        await new sql.Request(transaction)
          .input('routeId', sql.Int, id)
          .query('UPDATE Buses SET routeId = NULL WHERE routeId = @routeId');
        
        // Eliminar paradas de la ruta
        await new sql.Request(transaction)
          .input('routeId', sql.Int, id)
          .query('DELETE FROM RouteStops WHERE routeId = @routeId');
        
        // Eliminar la ruta
        const result = await new sql.Request(transaction)
          .input('id', sql.Int, id)
          .query('DELETE FROM Routes WHERE id = @id');
        
        // Confirmar transacción
        await transaction.commit();
        return result.rowsAffected[0] > 0;
      } catch (err) {
        // Revertir transacción en caso de error
        await transaction.rollback();
        console.error('Error deleting route in transaction:', err);
        throw err;
      }
    } catch (err) {
      console.error('Error deleting route:', err);
      throw err;
    }
  }

  async addStop(routeId, stopData) {
    try {
      const result = await this.sql.request()
        .input('routeId', sql.Int, routeId)
        .input('name', sql.VarChar, stopData.name)
        .input('lat', sql.Float, stopData.lat)
        .input('lng', sql.Float, stopData.lng)
        .query(`
          INSERT INTO RouteStops (routeId, name, lat, lng)
          VALUES (@routeId, @name, @lat, @lng);
          SELECT SCOPE_IDENTITY() AS id
        `);
      
      return result.recordset[0].id;
    } catch (err) {
      console.error('Error adding stop:', err);
      throw err;
    }
  }

  async updateStop(stopId, stopData) {
    try {
      let sqlQuery = 'UPDATE RouteStops SET ';
      const request = this.sql.request();
      request.input('id', sql.Int, stopId);
      
      const updateFields = [];
      
      if (stopData.name) {
        updateFields.push('name = @name');
        request.input('name', sql.VarChar, stopData.name);
      }
      
      if (stopData.lat !== undefined) {
        updateFields.push('lat = @lat');
        request.input('lat', sql.Float, stopData.lat);
      }
      
      if (stopData.lng !== undefined) {
        updateFields.push('lng = @lng');
        request.input('lng', sql.Float, stopData.lng);
      }
      
      updateFields.push('updatedAt = GETDATE()');
      
      if (updateFields.length === 0) {
        return false;
      }
      
      sqlQuery += updateFields.join(', ') + ' WHERE id = @id';
      
      const result = await request.query(sqlQuery);
      return result.rowsAffected[0] > 0;
    } catch (err) {
      console.error('Error updating stop:', err);
      throw err;
    }
  }

  async deleteStop(stopId) {
    try {
      const result = await this.sql.request()
        .input('id', sql.Int, stopId)
        .query('DELETE FROM RouteStops WHERE id = @id');
      
      return result.rowsAffected[0] > 0;
    } catch (err) {
      console.error('Error deleting stop:', err);
      throw err;
    }
  }
}

module.exports = RouteModel;
