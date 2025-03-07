
const { pool } = require('../config/db');

class Bus {
  // Obtener todos los buses
  static async findAll() {
    try {
      const result = await pool.query(`
        SELECT b.*, r.name as routeName 
        FROM Buses b 
        LEFT JOIN Routes r ON b.routeId = r.id
      `);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener buses:', error);
      throw error;
    }
  }

  // Buscar bus por ID
  static async findById(id) {
    try {
      const result = await pool.query(`
        SELECT b.*, r.name as routeName 
        FROM Buses b 
        LEFT JOIN Routes r ON b.routeId = r.id 
        WHERE b.id = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error al buscar bus por ID:', error);
      throw error;
    }
  }

  // Buscar bus por busId
  static async findByBusId(busId) {
    try {
      const result = await pool.query(`
        SELECT b.*, r.name as routeName 
        FROM Buses b 
        LEFT JOIN Routes r ON b.routeId = r.id 
        WHERE b.busId = $1
      `, [busId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error al buscar bus por busId:', error);
      throw error;
    }
  }

  // Crear un nuevo bus
  static async create(busData) {
    try {
      const { busId, routeId, capacity = 40, status = 'active' } = busData;
      
      const result = await pool.query(
        'INSERT INTO Buses (busId, routeId, capacity, currentOccupancy, status, batteryLevel) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [busId, routeId, capacity, 0, status, 100]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear bus:', error);
      throw error;
    }
  }

  // Actualizar bus
  static async update(id, updateData) {
    try {
      const keys = Object.keys(updateData);
      const values = Object.values(updateData);
      
      // Actualizar lastUpdated automáticamente
      keys.push('lastUpdated');
      values.push(new Date());
      
      // Construir query dinámicamente
      const setStatements = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
      const query = `UPDATE Buses SET ${setStatements} WHERE id = $1 RETURNING *`;
      
      const result = await pool.query(query, [id, ...values]);
      return result.rows[0];
    } catch (error) {
      console.error('Error al actualizar bus:', error);
      throw error;
    }
  }

  // Eliminar bus
  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM Buses WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error al eliminar bus:', error);
      throw error;
    }
  }

  // Obtener buses por ruta
  static async findByRouteId(routeId) {
    try {
      const result = await pool.query(`
        SELECT b.*, r.name as routeName 
        FROM Buses b 
        LEFT JOIN Routes r ON b.routeId = r.id 
        WHERE b.routeId = $1
      `, [routeId]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener buses por ruta:', error);
      throw error;
    }
  }
}

module.exports = Bus;
