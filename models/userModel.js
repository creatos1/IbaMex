
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  // Buscar usuario por ID
  static async findById(id) {
    try {
      const result = await pool.query('SELECT * FROM Users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  }

  // Buscar usuario por nombre de usuario
  static async findByUsername(username) {
    try {
      const result = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
      return result.rows[0];
    } catch (error) {
      console.error('Error al buscar usuario por nombre de usuario:', error);
      throw error;
    }
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    try {
      const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      throw error;
    }
  }

  // Crear un nuevo usuario
  static async create(userData) {
    try {
      const { username, email, password, role = 'user' } = userData;
      
      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const result = await pool.query(
        'INSERT INTO Users (username, email, password, role, mfaEnabled, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [username, email, hashedPassword, role, false, 'active']
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  // Actualizar usuario
  static async update(id, updateData) {
    try {
      const keys = Object.keys(updateData);
      const values = Object.values(updateData);
      
      // Construir query dinámicamente
      const setStatements = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
      const query = `UPDATE Users SET ${setStatements} WHERE id = $1 RETURNING *`;
      
      const result = await pool.query(query, [id, ...values]);
      return result.rows[0];
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // Eliminar usuario
  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM Users WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  // Validar contraseña
  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
