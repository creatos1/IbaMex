
const sql = require('mssql');

class BusModel {
  constructor(connection) {
    this.sql = connection;
  }

  async create(busData) {
    try {
      const result = await this.sql.request()
        .input('busId', sql.VarChar, busData.busId)
        .input('routeId', sql.Int, busData.routeId || null)
        .input('driverId', sql.Int, busData.driverId || null)
        .input('licensePlate', sql.VarChar, busData.licensePlate)
        .input('model', sql.VarChar, busData.model || null)
        .input('capacity', sql.Int, busData.capacity || 0)
        .input('status', sql.VarChar, busData.status || 'inactive')
        .input('active', sql.Bit, busData.active !== undefined ? busData.active : 1)
        .query(`
          INSERT INTO Buses (busId, routeId, driverId, licensePlate, model, capacity, status, active)
          VALUES (@busId, @routeId, @driverId, @licensePlate, @model, @capacity, @status, @active);
          SELECT SCOPE_IDENTITY() AS id
        `);
      
      return result.recordset[0].id;
    } catch (err) {
      console.error('Error creating bus:', err);
      throw err;
    }
  }

  async findById(id) {
    try {
      const result = await this.sql.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT b.*, r.name as routeName, u.username as driverUsername, u.fullName as driverName
          FROM Buses b 
          LEFT JOIN Routes r ON b.routeId = r.id
          LEFT JOIN Users u ON b.driverId = u.id
          WHERE b.id = @id
        `);
      
      return result.recordset[0];
    } catch (err) {
      console.error('Error finding bus by id:', err);
      throw err;
    }
  }

  async findByBusId(busId) {
    try {
      const result = await this.sql.request()
        .input('busId', sql.VarChar, busId)
        .query(`
          SELECT b.*, r.name as routeName, u.username as driverUsername, u.fullName as driverName
          FROM Buses b 
          LEFT JOIN Routes r ON b.routeId = r.id
          LEFT JOIN Users u ON b.driverId = u.id
          WHERE b.busId = @busId
        `);
      
      return result.recordset[0];
    } catch (err) {
      console.error('Error finding bus by busId:', err);
      throw err;
    }
  }

  async findAll(query = {}) {
    try {
      let sqlQuery = `
        SELECT b.*, r.name as routeName, u.username as driverUsername, u.fullName as driverName
        FROM Buses b 
        LEFT JOIN Routes r ON b.routeId = r.id
        LEFT JOIN Users u ON b.driverId = u.id
        WHERE 1=1
      `;
      
      const request = this.sql.request();
      
      if (query.routeId) {
        sqlQuery += ' AND b.routeId = @routeId';
        request.input('routeId', sql.Int, query.routeId);
      }
      
      if (query.driverId) {
        sqlQuery += ' AND b.driverId = @driverId';
        request.input('driverId', sql.Int, query.driverId);
      }
      
      if (query.status) {
        sqlQuery += ' AND b.status = @status';
        request.input('status', sql.VarChar, query.status);
      }
      
      if (query.active !== undefined) {
        sqlQuery += ' AND b.active = @active';
        request.input('active', sql.Bit, query.active);
      }
      
      if (query.searchTerm) {
        sqlQuery += ' AND (b.busId LIKE @search OR b.licensePlate LIKE @search OR r.name LIKE @search)';
        request.input('search', sql.VarChar, `%${query.searchTerm}%`);
      }
      
      sqlQuery += ' ORDER BY b.id DESC';
      
      const result = await request.query(sqlQuery);
      return result.recordset;
    } catch (err) {
      console.error('Error finding buses:', err);
      throw err;
    }
  }

  async update(id, busData) {
    try {
      let sqlQuery = 'UPDATE Buses SET ';
      const request = this.sql.request();
      request.input('id', sql.Int, id);
      
      const updateFields = [];
      
      if (busData.busId) {
        updateFields.push('busId = @busId');
        request.input('busId', sql.VarChar, busData.busId);
      }
      
      if (busData.routeId !== undefined) {
        updateFields.push('routeId = @routeId');
        request.input('routeId', sql.Int, busData.routeId === null ? null : busData.routeId);
      }
      
      if (busData.driverId !== undefined) {
        updateFields.push('driverId = @driverId');
        request.input('driverId', sql.Int, busData.driverId === null ? null : busData.driverId);
      }
      
      if (busData.licensePlate) {
        updateFields.push('licensePlate = @licensePlate');
        request.input('licensePlate', sql.VarChar, busData.licensePlate);
      }
      
      if (busData.model !== undefined) {
        updateFields.push('model = @model');
        request.input('model', sql.VarChar, busData.model);
      }
      
      if (busData.capacity !== undefined) {
        updateFields.push('capacity = @capacity');
        request.input('capacity', sql.Int, busData.capacity);
      }
      
      if (busData.status) {
        updateFields.push('status = @status');
        request.input('status', sql.VarChar, busData.status);
      }
      
      if (busData.active !== undefined) {
        updateFields.push('active = @active');
        request.input('active', sql.Bit, busData.active);
      }
      
      if (busData.currentLocation) {
        updateFields.push('currentLocation = geography::Point(@latitude, @longitude, 4326)');
        request.input('latitude', sql.Float, busData.currentLocation.latitude);
        request.input('longitude', sql.Float, busData.currentLocation.longitude);
      }
      
      if (busData.lastPing) {
        updateFields.push('lastPing = @lastPing');
        request.input('lastPing', sql.DateTime, busData.lastPing);
      }
      
      if (busData.currentPassengers !== undefined) {
        updateFields.push('currentPassengers = @currentPassengers');
        request.input('currentPassengers', sql.Int, busData.currentPassengers);
      }
      
      updateFields.push('updatedAt = GETDATE()');
      
      if (updateFields.length === 0) {
        return false;
      }
      
      sqlQuery += updateFields.join(', ') + ' WHERE id = @id';
      
      const result = await request.query(sqlQuery);
      return result.rowsAffected[0] > 0;
    } catch (err) {
      console.error('Error updating bus:', err);
      throw err;
    }
  }

  async delete(id) {
    try {
      // Primero eliminar logs relacionados
      await this.sql.request()
        .input('busId', sql.Int, id)
        .query('DELETE FROM OccupancyLogs WHERE busId = @busId');
      
      // Luego eliminar el bus
      const result = await this.sql.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Buses WHERE id = @id');
      
      return result.rowsAffected[0] > 0;
    } catch (err) {
      console.error('Error deleting bus:', err);
      throw err;
    }
  }

  async updatePassengerCount(id, count) {
    try {
      const result = await this.sql.request()
        .input('id', sql.Int, id)
        .input('count', sql.Int, count)
        .query(`
          UPDATE Buses 
          SET currentPassengers = @count, updatedAt = GETDATE() 
          WHERE id = @id
        `);
      
      return result.rowsAffected[0] > 0;
    } catch (err) {
      console.error('Error updating passenger count:', err);
      throw err;
    }
  }

  async logOccupancy(busId, count, location = null) {
    try {
      const request = this.sql.request()
        .input('busId', sql.Int, busId)
        .input('count', sql.Int, count);
      
      let query = `
        INSERT INTO OccupancyLogs (busId, passengerCount
      `;
      
      if (location) {
        query += `, latitude, longitude, location`;
        request.input('latitude', sql.Float, location.latitude);
        request.input('longitude', sql.Float, location.longitude);
      }
      
      query += `) VALUES (@busId, @count`;
      
      if (location) {
        query += `, @latitude, @longitude, geography::Point(@latitude, @longitude, 4326)`;
      }
      
      query += `)`;
      
      await request.query(query);
      
      // Actualizar también el contador actual en el bus
      await this.updatePassengerCount(busId, count);
      
      return true;
    } catch (err) {
      console.error('Error logging occupancy:', err);
      throw err;
    }
  }
}

module.exports = BusModel;
