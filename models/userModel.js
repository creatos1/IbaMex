
const sql = require('mssql');

class UserModel {
  constructor(connection) {
    this.sql = connection;
  }

  async create(userData) {
    try {
      // Insertar el usuario
      const result = await this.sql.request()
        .input('username', sql.NVarChar, userData.username)
        .input('email', sql.NVarChar, userData.email)
        .input('password', sql.NVarChar, userData.password)
        .input('fullName', sql.NVarChar, userData.fullName || null)
        .input('role', sql.NVarChar, userData.role || 'user')
        .input('mfaEnabled', sql.Bit, userData.mfaEnabled || 0)
        .input('active', sql.Bit, userData.active || 1)
        .query(`
          INSERT INTO Users (username, password, email, fullName, role, mfaEnabled, active)
          VALUES (@username, @password, @email, @fullName, @role, @mfaEnabled, @active);
          SELECT SCOPE_IDENTITY() AS id
        `);
      
      return result.recordset[0].id;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  async findByEmail(email) {
    try {
      const result = await this.sql.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT * FROM Users WHERE email = @email');
      
      return result.recordset[0];
    } catch (err) {
      console.error('Error finding user by email:', err);
      throw err;
    }
  }

  async findByUsername(username) {
    try {
      const result = await this.sql.request()
        .input('username', sql.NVarChar, username)
        .query('SELECT * FROM Users WHERE username = @username');
      
      return result.recordset[0];
    } catch (err) {
      console.error('Error finding user by username:', err);
      throw err;
    }
  }

  async findById(id) {
    try {
      const result = await this.sql.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Users WHERE id = @id');
      
      return result.recordset[0];
    } catch (err) {
      console.error('Error finding user by id:', err);
      throw err;
    }
  }

  async findAll(query = {}) {
    try {
      // Construir consulta según los criterios
      let sqlQuery = 'SELECT * FROM Users WHERE 1=1';
      const request = this.sql.request();
      
      if (query.role) {
        sqlQuery += ' AND role = @role';
        request.input('role', sql.NVarChar, query.role);
      }
      
      if (query.active !== undefined) {
        sqlQuery += ' AND active = @active';
        request.input('active', sql.Bit, query.active);
      }
      
      const result = await request.query(sqlQuery);
      return result.recordset;
    } catch (err) {
      console.error('Error finding users:', err);
      throw err;
    }
  }

  async update(id, userData) {
    try {
      // Construir consulta dinámica
      let sqlQuery = 'UPDATE Users SET ';
      const request = this.sql.request();
      request.input('id', sql.Int, id);
      
      const updateFields = [];
      
      if (userData.username) {
        updateFields.push('username = @username');
        request.input('username', sql.NVarChar, userData.username);
      }
      
      if (userData.email) {
        updateFields.push('email = @email');
        request.input('email', sql.NVarChar, userData.email);
      }
      
      if (userData.password) {
        updateFields.push('password = @password');
        request.input('password', sql.NVarChar, userData.password);
      }
      
      if (userData.fullName) {
        updateFields.push('fullName = @fullName');
        request.input('fullName', sql.NVarChar, userData.fullName);
      }
      
      if (userData.role) {
        updateFields.push('role = @role');
        request.input('role', sql.NVarChar, userData.role);
      }
      
      if (userData.mfaEnabled !== undefined) {
        updateFields.push('mfaEnabled = @mfaEnabled');
        request.input('mfaEnabled', sql.Bit, userData.mfaEnabled ? 1 : 0);
      }
      
      if (userData.mfaSecret !== undefined) {
        updateFields.push('mfaSecret = @mfaSecret');
        request.input('mfaSecret', sql.NVarChar, userData.mfaSecret);
      }
      
      if (userData.active !== undefined) {
        updateFields.push('active = @active');
        request.input('active', sql.Bit, userData.active ? 1 : 0);
      }
      
      updateFields.push('updatedAt = GETDATE()');
      
      if (updateFields.length === 0) {
        return false; // No hay campos para actualizar
      }
      
      sqlQuery += updateFields.join(', ') + ' WHERE id = @id';
      
      const result = await request.query(sqlQuery);
      return result.rowsAffected[0] > 0;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }

  async toggleMfa(id, enable, secret = null) {
    try {
      const request = this.sql.request()
        .input('id', sql.Int, id)
        .input('mfaEnabled', sql.Bit, enable ? 1 : 0);
      
      let query = `UPDATE Users SET mfaEnabled = @mfaEnabled`;
      
      if (secret !== null) {
        query += `, mfaSecret = @mfaSecret`;
        request.input('mfaSecret', sql.NVarChar, secret);
      } else if (!enable) {
        query += `, mfaSecret = NULL`;
      }
      
      query += `, updatedAt = GETDATE() WHERE id = @id`;
      
      const result = await request.query(query);
      return result.rowsAffected[0] > 0;
    } catch (err) {
      console.error('Error toggling MFA:', err);
      throw err;
    }
  }

  async delete(id) {
    try {
      const result = await this.sql.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Users WHERE id = @id');
      
      return result.rowsAffected[0] > 0;
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }
}

module.exports = UserModel;
