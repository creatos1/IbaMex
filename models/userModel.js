
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const sql = require('mssql');


dotenv.config();

class User {
  // Find user by ID
  static async findById(id) {
    try {
      const request = new sql.Request();
      const result = await request.query`SELECT * FROM Users WHERE id = ${id}`;
      return result.recordset[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const request = new sql.Request();
      const result = await request.query`SELECT * FROM Users WHERE username = ${username}`;
      return result.recordset[0];
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const request = new sql.Request();
      const result = await request.query`SELECT * FROM Users WHERE email = ${email}`;
      return result.recordset[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Find one user by any criteria (simplified version of MongoDB's findOne)
  static async findOne(criteria) {
    try {
      const request = new sql.Request();
      
      // Simple case - email lookup
      if (criteria.email) {
        return await this.findByEmail(criteria.email);
      }
      
      // Handle direct field matching (simplified)
      let whereClause = '';
      for (const [key, value] of Object.entries(criteria)) {
        if (key !== '$or') {
          if (whereClause) whereClause += ' AND ';
          request.input(key, value);
          whereClause += `${key} = @${key}`;
        }
      }
      
      // Simple implementation for $or operator
      if (criteria.$or) {
        const orClauses = [];
        let i = 0;
        
        for (const condition of criteria.$or) {
          for (const [key, value] of Object.entries(condition)) {
            const paramName = `${key}${i}`;
            request.input(paramName, value);
            orClauses.push(`${key} = @${paramName}`);
            i++;
          }
        }
        
        if (orClauses.length > 0) {
          if (whereClause) whereClause += ' AND ';
          whereClause += `(${orClauses.join(' OR ')})`;
        }
      }
      
      const query = `SELECT * FROM Users WHERE ${whereClause}`;
      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  // Create a new user
  static async create(userData) {
    try {
      const { username, email, password, role = 'user', mfaEnabled = false, status = 'active' } = userData;
      
      const request = new sql.Request();
      request.input('username', sql.VarChar, username);
      request.input('email', sql.VarChar, email);
      request.input('password', sql.VarChar, password);
      request.input('role', sql.VarChar, role);
      request.input('mfaEnabled', sql.Bit, mfaEnabled ? 1 : 0);
      request.input('status', sql.VarChar, status);
      
      const result = await request.query(
        'INSERT INTO Users (username, email, password, role, mfaEnabled, status) OUTPUT INSERTED.* VALUES (@username, @email, @password, @role, @mfaEnabled, @status)'
      );
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update a user
  static async update(id, updateData) {
    try {
      const request = new sql.Request();
      request.input('id', id);
      
      // Build query dynamically
      const setStatements = [];
      for (const [key, value] of Object.entries(updateData)) {
        request.input(key, value);
        setStatements.push(`${key} = @${key}`);
      }
      
      const query = `UPDATE Users SET ${setStatements.join(', ')} 
                    OUTPUT INSERTED.* WHERE id = @id`;
      
      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete a user
  static async delete(id) {
    try {
      const request = new sql.Request();
      const result = await request.query`DELETE FROM Users OUTPUT DELETED.* WHERE id = ${id}`;
      return result.recordset[0];
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Save changes (for compatibility with MongoDB model)
  async save() {
    try {
      const request = new sql.Request();
      
      if (this.id) {
        // Update existing user
        request.input('id', this.id);
        
        const setStatements = [];
        for (const [key, value] of Object.entries(this)) {
          if (key !== 'id') {
            request.input(key, value);
            setStatements.push(`${key} = @${key}`);
          }
        }
        
        const query = `UPDATE Users SET ${setStatements.join(', ')} 
                      OUTPUT INSERTED.* WHERE id = @id`;
        
        const result = await request.query(query);
        return result.recordset[0];
      } else {
        // Create new user
        const keys = Object.keys(this);
        const columns = keys.join(', ');
        const paramNames = keys.map(k => `@${k}`).join(', ');
        
        // Set input parameters
        for (const [key, value] of Object.entries(this)) {
          request.input(key, value);
        }
        
        const query = `INSERT INTO Users (${columns}) 
                      OUTPUT INSERTED.* VALUES (${paramNames})`;
        
        const result = await request.query(query);
        this.id = result.recordset[0].id;
        return result.recordset[0];
      }
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }
}

module.exports = User;
