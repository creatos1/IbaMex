
const { pool } = require('../config/db');

class OccupancyLog {
  // Registrar nueva ocupación
  static async create(logData) {
    try {
      const { busId, routeId, count } = logData;
      
      const result = await pool.query(
        'INSERT INTO OccupancyLogs (busId, routeId, count, timestamp) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *',
        [busId, routeId, count]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear registro de ocupación:', error);
      throw error;
    }
  }

  // Obtener logs de ocupación por busId
  static async findByBusId(busId, limit = 24) {
    try {
      const result = await pool.query(
        'SELECT * FROM OccupancyLogs WHERE busId = $1 ORDER BY timestamp DESC LIMIT $2',
        [busId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error al obtener logs por busId:', error);
      throw error;
    }
  }

  // Obtener logs de ocupación por routeId
  static async findByRouteId(routeId, limit = 100) {
    try {
      const result = await pool.query(
        'SELECT * FROM OccupancyLogs WHERE routeId = $1 ORDER BY timestamp DESC LIMIT $2',
        [routeId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error al obtener logs por routeId:', error);
      throw error;
    }
  }

  // Obtener estadísticas de ocupación por busId
  static async getStatsByBusId(busId) {
    try {
      const result = await pool.query(`
        SELECT 
          AVG(count) as average,
          MAX(count) as maximum,
          MIN(count) as minimum
        FROM OccupancyLogs
        WHERE busId = $1 AND timestamp > NOW() - INTERVAL '24 hours'
      `, [busId]);
      
      return {
        average: parseFloat(result.rows[0].average) || 0,
        maximum: parseInt(result.rows[0].maximum) || 0,
        minimum: parseInt(result.rows[0].minimum) || 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas por busId:', error);
      throw error;
    }
  }

  // Obtener estadísticas de ocupación por routeId
  static async getStatsByRouteId(routeId) {
    try {
      const result = await pool.query(`
        SELECT 
          AVG(count) as average,
          MAX(count) as maximum,
          MIN(count) as minimum
        FROM OccupancyLogs
        WHERE routeId = $1 AND timestamp > NOW() - INTERVAL '24 hours'
      `, [routeId]);
      
      return {
        average: parseFloat(result.rows[0].average) || 0,
        maximum: parseInt(result.rows[0].maximum) || 0,
        minimum: parseInt(result.rows[0].minimum) || 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas por routeId:', error);
      throw error;
    }
  }
}

module.exports = OccupancyLog;
