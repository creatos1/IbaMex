
const sql = require('mssql');
const config = require('../config/db');

class UserModel {
  static async create(userData) {
    try {
      const pool = await sql.connect(config);
      
      // Verificar si la tabla existe
      const tableExists = await pool.request()
        .query(`
          SELECT * FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_NAME = 'Users'
        `);
      
      // Si la tabla no existe, crearla
      if (tableExists.recordset.length === 0) {
        await pool.request().query(`
          CREATE TABLE Users (
            Id INT IDENTITY(1,1) PRIMARY KEY,
            Username NVARCHAR(100) NOT NULL,
            Email NVARCHAR(100) NOT NULL UNIQUE,
            Password NVARCHAR(255) NOT NULL,
            Role NVARCHAR(20) DEFAULT 'user',
            MfaEnabled BIT DEFAULT 0,
            Status NVARCHAR(20) DEFAULT 'active',
            CreatedAt DATETIME DEFAULT GETDATE()
          )
        `);
      }
      
      // Verificar si la columna status existe
      const columnExists = await pool.request()
        .query(`
          SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'Status'
        `);
      
      // Si la columna no existe, añadirla
      if (columnExists.recordset.length === 0) {
        await pool.request().query(`
          ALTER TABLE Users ADD Status NVARCHAR(20) DEFAULT 'active'
        `);
      }
      
      // Insertar el usuario
      const result = await pool.request()
        .input('username', sql.NVarChar, userData.username)
        .input('email', sql.NVarChar, userData.email)
        .input('password', sql.NVarChar, userData.password)
        .input('role', sql.NVarChar, userData.role || 'user')
        .input('mfaEnabled', sql.Bit, userData.mfaEnabled || 0)
        .input('status', sql.NVarChar, userData.status || 'active')
        .query(`
          INSERT INTO Users (Username, Email, Password, Role, MfaEnabled, Status)
          VALUES (@username, @email, @password, @role, @mfaEnabled, @status);
          SELECT SCOPE_IDENTITY() AS Id
        `);
      
      return result.recordset[0].Id;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  static async findByEmail(email) {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT * FROM Users WHERE Email = @email');
      
      return result.recordset[0];
    } catch (err) {
      console.error('Error finding user by email:', err);
      throw err;
    }
  }

  static async findByUsername(username) {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('username', sql.NVarChar, username)
        .query('SELECT * FROM Users WHERE Username = @username');
      
      return result.recordset[0];
    } catch (err) {
      console.error('Error finding user by username:', err);
      throw err;
    }
  }

  static async findById(id) {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Users WHERE Id = @id');
      
      return result.recordset[0];
    } catch (err) {
      console.error('Error finding user by id:', err);
      throw err;
    }
  }

  static async find(query = {}) {
    try {
      const pool = await sql.connect(config);
      
      // Construir consulta según los criterios
      let sqlQuery = 'SELECT * FROM Users WHERE 1=1';
      const request = pool.request();
      
      if (query.role) {
        sqlQuery += ' AND Role = @role';
        request.input('role', sql.NVarChar, query.role);
      }
      
      if (query.status) {
        sqlQuery += ' AND Status = @status';
        request.input('status', sql.NVarChar, query.status);
      }
      
      const result = await request.query(sqlQuery);
      return result.recordset;
    } catch (err) {
      console.error('Error finding users:', err);
      throw err;
    }
  }

  static async update(id, userData) {
    try {
      const pool = await sql.connect(config);
      
      // Construir consulta dinámica
      let sqlQuery = 'UPDATE Users SET ';
      const request = pool.request();
      request.input('id', sql.Int, id);
      
      const updateFields = [];
      
      if (userData.username) {
        updateFields.push('Username = @username');
        request.input('username', sql.NVarChar, userData.username);
      }
      
      if (userData.email) {
        updateFields.push('Email = @email');
        request.input('email', sql.NVarChar, userData.email);
      }
      
      if (userData.password) {
        updateFields.push('Password = @password');
        request.input('password', sql.NVarChar, userData.password);
      }
      
      if (userData.role) {
        updateFields.push('Role = @role');
        request.input('role', sql.NVarChar, userData.role);
      }
      
      if (userData.mfaEnabled !== undefined) {
        updateFields.push('MfaEnabled = @mfaEnabled');
        request.input('mfaEnabled', sql.Bit, userData.mfaEnabled ? 1 : 0);
      }
      
      if (userData.status) {
        updateFields.push('Status = @status');
        request.input('status', sql.NVarChar, userData.status);
      }
      
      if (updateFields.length === 0) {
        return false; // No hay campos para actualizar
      }
      
      sqlQuery += updateFields.join(', ') + ' WHERE Id = @id';
      
      const result = await request.query(sqlQuery);
      return result.rowsAffected[0] > 0;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }
}

module.exports = UserModel;
