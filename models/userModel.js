const sql = require('mssql');

class UserModel {
  constructor(connection) {
    this.sql = connection;
  }

  async create(userData) {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .input('username', sql.VarChar, userData.username)
        .input('email', sql.VarChar, userData.email)
        .input('password', sql.VarChar, userData.password)
        .input('fullName', sql.VarChar, userData.fullName)
        .input('role', sql.VarChar, userData.role)
        .input('mfaEnabled', sql.Bit, userData.mfaEnabled)
        .input('active', sql.Bit, userData.active)
        .query(`
          INSERT INTO Users (username, email, password, fullName, role, mfaEnabled, active)
          VALUES (@username, @email, @password, @fullName, @role, @mfaEnabled, @active);
          SELECT SCOPE_IDENTITY() AS id;
        `);
      return result.recordset[0].id;
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .input('email', sql.VarChar, email)
        .query('SELECT * FROM Users WHERE email = @email');
      return result.recordset[0];
    } catch (error) {
      console.error('Error en findByEmail:', error);
      throw error;
    }
  }

  async findByUsername(username) {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .input('username', sql.VarChar, username)
        .query('SELECT * FROM Users WHERE username = @username');
      return result.recordset[0];
    } catch (error) {
      console.error('Error en findByUsername:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
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
      let sqlQuery = 'SELECT * FROM Users WHERE 1=1';
      const pool = await this.getPool();
      const request = pool.request();

      if (query.role) {
        sqlQuery += ' AND role = @role';
        request.input('role', sql.VarChar, query.role);
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
      let sqlQuery = 'UPDATE Users SET ';
      const pool = await this.getPool();
      const request = pool.request();
      request.input('id', sql.Int, id);

      const updateFields = [];

      if (userData.username) {
        updateFields.push('username = @username');
        request.input('username', sql.VarChar, userData.username);
      }

      if (userData.email) {
        updateFields.push('email = @email');
        request.input('email', sql.VarChar, userData.email);
      }

      if (userData.password) {
        updateFields.push('password = @password');
        request.input('password', sql.VarChar, userData.password);
      }

      if (userData.fullName) {
        updateFields.push('fullName = @fullName');
        request.input('fullName', sql.VarChar, userData.fullName);
      }

      if (userData.role) {
        updateFields.push('role = @role');
        request.input('role', sql.VarChar, userData.role);
      }

      if (userData.mfaEnabled !== undefined) {
        updateFields.push('mfaEnabled = @mfaEnabled');
        request.input('mfaEnabled', sql.Bit, userData.mfaEnabled ? 1 : 0);
      }

      if (userData.mfaSecret !== undefined) {
        updateFields.push('mfaSecret = @mfaSecret');
        request.input('mfaSecret', sql.VarChar, userData.mfaSecret);
      }

      if (userData.active !== undefined) {
        updateFields.push('active = @active');
        request.input('active', sql.Bit, userData.active ? 1 : 0);
      }

      updateFields.push('updatedAt = GETDATE()');

      if (updateFields.length === 0) {
        return false; 
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
      const pool = await this.getPool();
      const request = pool.request()
        .input('id', sql.Int, id)
        .input('mfaEnabled', sql.Bit, enable ? 1 : 0);

      let query = `UPDATE Users SET mfaEnabled = @mfaEnabled`;

      if (secret !== null) {
        query += `, mfaSecret = @mfaSecret`;
        request.input('mfaSecret', sql.VarChar, secret);
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
      const pool = await this.getPool();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Users WHERE id = @id');
      return result.rowsAffected[0] > 0;
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }

  async getPool() {
    if (this.sql.constructor.name === 'ConnectionPool') {
      return this.sql;
    }
    return await sql.connect(this.sql);
  }

  async findDrivers() {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .query('SELECT id, username, email, fullName, active FROM Users WHERE role = \'driver\'');
      return result.recordset;
    } catch (error) {
      console.error('Error finding drivers:', error);
      throw error;
    }
  }
}

module.exports = UserModel;