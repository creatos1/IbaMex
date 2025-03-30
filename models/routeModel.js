// models/RouteModel.js
const sql = require('mssql');

class RouteModel {
  constructor(connection) {
    this.sql = connection;
  }

  async create(routeData) {
    const transaction = new sql.Transaction(await this.getPool());
    
    try {
      await transaction.begin();
      
      // 1. Insertar la ruta principal
      const routeResult = await transaction.request()
        .input('name', sql.VarChar, routeData.name)
        .input('description', sql.Text, routeData.description)
        .input('routeId', sql.VarChar, `RUTA-${Date.now()}`)
        .query(`
          INSERT INTO Routes (name, description, routeId)
          OUTPUT INSERTED.id
          VALUES (@name, @description, @routeId)
        `);

      const routeId = routeResult.recordset[0].id;

      // 2. Insertar las paradas
      for (const stop of routeData.stops) {
        await transaction.request()
          .input('routeId', sql.Int, routeId)
          .input('name', sql.VarChar, stop.name)
          .input('lat', sql.Float, stop.lat)
          .input('lng', sql.Float, stop.lng)
          .query(`
            INSERT INTO RouteStops (routeId, name, lat, lng)
            VALUES (@routeId, @name, @lat, @lng)
          `);
      }

      await transaction.commit();
      
      // 3. Obtener la ruta completa con sus paradas
      return await this.findById(routeId);
    } catch (error) {
      await transaction.rollback();
      console.error('Error en RouteModel.create:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .query(`
          SELECT r.*, 
            (SELECT rs.* FROM RouteStops rs WHERE rs.routeId = r.id FOR JSON PATH) AS stops
          FROM Routes r
          WHERE r.active = 1
        `);

      return result.recordset.map(route => {
        route.stops = JSON.parse(route.stops);
        return route;
      });
    } catch (error) {
      console.error('Error en RouteModel.findAll:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT r.*, 
            (SELECT rs.* FROM RouteStops rs WHERE rs.routeId = r.id FOR JSON PATH) AS stops
          FROM Routes r
          WHERE r.id = @id
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      const route = result.recordset[0];
      route.stops = JSON.parse(route.stops);
      return route;
    } catch (error) {
      console.error('Error en RouteModel.findById:', error);
      throw error;
    }
  }

  async update(id, routeData) {
    const transaction = new sql.Transaction(await this.getPool());
    
    try {
      await transaction.begin();

      // 1. Actualizar la ruta principal
      let updateQuery = 'UPDATE Routes SET ';
      const request = transaction.request();
      request.input('id', sql.Int, id);

      const updateFields = [];
      
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
        updateQuery += updateFields.join(', ') + ' WHERE id = @id';
        await request.query(updateQuery);
      }

      // 2. Si hay paradas, actualizarlas (esto es más complejo)
      if (routeData.stops) {
        // Primero eliminar las paradas existentes
        await transaction.request()
          .input('routeId', sql.Int, id)
          .query('DELETE FROM RouteStops WHERE routeId = @routeId');
        
        // Luego insertar las nuevas
        for (const stop of routeData.stops) {
          await transaction.request()
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

      await transaction.commit();
      return await this.findById(id);
    } catch (error) {
      await transaction.rollback();
      console.error('Error en RouteModel.update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const pool = await this.getPool();
      // Usamos DELETE CASCADE (definido en la FK de RouteStops)
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Routes WHERE id = @id');
      
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error en RouteModel.delete:', error);
      throw error;
    }
  }

  async getPool() {
    if (this.sql.constructor.name === 'ConnectionPool') {
      return this.sql;
    }
    return await sql.connect(this.sql);
  }
}

module.exports = RouteModel;