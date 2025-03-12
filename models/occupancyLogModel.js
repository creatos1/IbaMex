
const sql = require('mssql');

class OccupancyLogModel {
  constructor(connection) {
    this.sql = connection;
  }

  async create(logData) {
    try {
      // Determine the SQL request object
      let request;
      const sql = this.sql.constructor.name === 'ConnectionPool' ? this.sql : require('mssql');
      
      if (typeof this.sql.request === 'function') {
        request = this.sql.request();
      } else if (this.sql.Request) {
        request = new this.sql.Request();
      } else {
        request = this.sql;
      }
      
      request.input('busId', sql.Int, logData.busId)
        .input('passengerCount', sql.Int, logData.passengerCount);
      
      let query = `
        INSERT INTO OccupancyLogs (busId, passengerCount`;
      
      if (logData.latitude !== undefined && logData.longitude !== undefined) {
        query += `, latitude, longitude, location`;
        request.input('latitude', sql.Float, logData.latitude);
        request.input('longitude', sql.Float, logData.longitude);
      }
      
      if (logData.timestamp) {
        query += `, timestamp`;
        request.input('timestamp', sql.DateTime, logData.timestamp);
      }
      
      query += `) VALUES (@busId, @passengerCount`;
      
      if (logData.latitude !== undefined && logData.longitude !== undefined) {
        query += `, @latitude, @longitude, geography::Point(@latitude, @longitude, 4326)`;
      }
      
      if (logData.timestamp) {
        query += `, @timestamp`;
      }
      
      query += `);
        SELECT SCOPE_IDENTITY() AS id`;
      
      const result = await request.query(query);
      
      return result.recordset[0].id;
    } catch (err) {
      console.error('Error creating occupancy log:', err);
      throw err;
    }
  }

  async findByBusId(busId, options = {}) {
    try {
      let query = `
        SELECT * FROM OccupancyLogs 
        WHERE busId = @busId`;
      
      const request = this.sql.request()
        .input('busId', sql.Int, busId);
      
      if (options.startDate) {
        query += ` AND timestamp >= @startDate`;
        request.input('startDate', sql.DateTime, options.startDate);
      }
      
      if (options.endDate) {
        query += ` AND timestamp <= @endDate`;
        request.input('endDate', sql.DateTime, options.endDate);
      }
      
      query += ` ORDER BY timestamp DESC`;
      
      if (options.limit) {
        query += ` OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY`;
        request.input('limit', sql.Int, options.limit);
      }
      
      const result = await request.query(query);
      
      return result.recordset;
    } catch (err) {
      console.error('Error finding occupancy logs by busId:', err);
      throw err;
    }
  }

  async getStatsByBusId(busId, options = {}) {
    try {
      let query = `
        SELECT 
          CONVERT(DATE, timestamp) as date,
          AVG(passengerCount) as averageCount,
          MAX(passengerCount) as maxCount,
          MIN(passengerCount) as minCount,
          COUNT(*) as sampleCount
        FROM OccupancyLogs 
        WHERE busId = @busId`;
      
      const request = this.sql.request()
        .input('busId', sql.Int, busId);
      
      if (options.startDate) {
        query += ` AND timestamp >= @startDate`;
        request.input('startDate', sql.DateTime, options.startDate);
      }
      
      if (options.endDate) {
        query += ` AND timestamp <= @endDate`;
        request.input('endDate', sql.DateTime, options.endDate);
      }
      
      query += ` GROUP BY CONVERT(DATE, timestamp)
        ORDER BY date DESC`;
      
      if (options.limit) {
        query += ` OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY`;
        request.input('limit', sql.Int, options.limit);
      }
      
      const result = await request.query(query);
      
      return result.recordset;
    } catch (err) {
      console.error('Error getting occupancy stats by busId:', err);
      throw err;
    }
  }

  async getHourlyStatsByBusId(busId, date) {
    try {
      // Convertir date a objeto Date si es string
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Crear fecha inicio (00:00:00) y fin (23:59:59)
      const startOfDay = new Date(dateObj);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(dateObj);
      endOfDay.setHours(23, 59, 59, 999);
      
      const query = `
        SELECT 
          DATEPART(HOUR, timestamp) as hour,
          AVG(passengerCount) as averageCount,
          MAX(passengerCount) as maxCount,
          MIN(passengerCount) as minCount,
          COUNT(*) as sampleCount
        FROM OccupancyLogs 
        WHERE busId = @busId
          AND timestamp >= @startDate
          AND timestamp <= @endDate
        GROUP BY DATEPART(HOUR, timestamp)
        ORDER BY hour ASC
      `;
      
      const result = await this.sql.request()
        .input('busId', sql.Int, busId)
        .input('startDate', sql.DateTime, startOfDay)
        .input('endDate', sql.DateTime, endOfDay)
        .query(query);
      
      return result.recordset;
    } catch (err) {
      console.error('Error getting hourly occupancy stats:', err);
      throw err;
    }
  }

  async deleteByBusId(busId) {
    try {
      const request = new this.sql.Request();
      const result = await request
        .input('busId', this.sql.Int, busId)
        .query('DELETE FROM OccupancyLogs WHERE busId = @busId');
      
      return result.rowsAffected[0];
    } catch (err) {
      console.error('Error deleting occupancy logs by busId:', err);
      throw err;
    }
  }

  async deleteOlderThan(days) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const request = new this.sql.Request();
      const result = await request
        .input('cutoffDate', this.sql.DateTime, cutoffDate)
        .query('DELETE FROM OccupancyLogs WHERE timestamp < @cutoffDate');
      
      return result.rowsAffected[0];
    } catch (err) {
      console.error('Error deleting old occupancy logs:', err);
      throw err;
    }
  }
}

module.exports = OccupancyLogModel;
