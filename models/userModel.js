
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Get database connection details from environment variables
const connectionString = process.env.DATABASE_URL;

// Create a connection pool
const pool = new Pool({
  connectionString: connectionString
});

class User {
  // Find user by ID
  static async findById(id) {
    try {
      const result = await pool.query('SELECT * FROM Users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const result = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Find one user by any criteria (simplified version of MongoDB's findOne)
  static async findOne(criteria) {
    try {
      let query = 'SELECT * FROM Users WHERE ';
      const params = [];
      let paramIndex = 1;
      
      // Handle $or operator (simplified)
      if (criteria.$or) {
        const orClauses = [];
        
        for (const condition of criteria.$or) {
          const key = Object.keys(condition)[0];
          orClauses.push(`${key} = $${paramIndex}`);
          params.push(condition[key]);
          paramIndex++;
        }
        
        query += orClauses.join(' OR ');
      } else {
        // Handle direct field matching
        const conditions = [];
        for (const [key, value] of Object.entries(criteria)) {
          conditions.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
        query += conditions.join(' AND ');
      }
      
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  // Create a new user
  static async create(userData) {
    try {
      const { username, email, password, role = 'user', mfaEnabled = false, status = 'active' } = userData;
      
      const result = await pool.query(
        'INSERT INTO Users (username, email, password, role, mfaEnabled, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [username, email, password, role, mfaEnabled, status]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update a user
  static async update(id, updateData) {
    try {
      const keys = Object.keys(updateData);
      const values = Object.values(updateData);
      
      // Build query dynamically
      const setStatements = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
      const query = `UPDATE Users SET ${setStatements} WHERE id = $1 RETURNING *`;
      
      const result = await pool.query(query, [id, ...values]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete a user
  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM Users WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Save changes (for compatibility with MongoDB model)
  async save() {
    try {
      if (this.id) {
        // Update existing user
        const keys = Object.keys(this).filter(k => k !== 'id');
        const values = keys.map(k => this[k]);
        
        const setStatements = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
        const query = `UPDATE Users SET ${setStatements} WHERE id = $1 RETURNING *`;
        
        const result = await pool.query(query, [this.id, ...values]);
        return result.rows[0];
      } else {
        // Create new user
        const keys = Object.keys(this);
        const values = keys.map(k => this[k]);
        
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
        const query = `INSERT INTO Users (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        
        const result = await pool.query(query, values);
        this.id = result.rows[0].id;
        return result.rows[0];
      }
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }
}

module.exports = User;
