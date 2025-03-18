
const sql = require('mssql');

class VerificationCodeModel {
  constructor(connection) {
    this.sql = connection;
  }

  async create(email, code) {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .input('email', sql.VarChar, email)
        .input('code', sql.VarChar, code)
        .query(`
          INSERT INTO VerificationCodes (email, code)
          VALUES (@email, @code);
          SELECT SCOPE_IDENTITY() AS id;
        `);
      return result.recordset[0].id;
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async findByEmailAndCode(email, code) {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .input('email', sql.VarChar, email)
        .input('code', sql.VarChar, code)
        .query(`
          SELECT TOP 1 * FROM VerificationCodes 
          WHERE email = @email 
          AND code = @code 
          AND createdAt >= DATEADD(MINUTE, -10, GETDATE())
          ORDER BY createdAt DESC
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error en findByEmailAndCode:', error);
      throw error;
    }
  }

  async deleteByEmail(email) {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .input('email', sql.VarChar, email)
        .query('DELETE FROM VerificationCodes WHERE email = @email');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error en deleteByEmail:', error);
      throw error;
    }
  }

  async cleanupExpired() {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .query('DELETE FROM VerificationCodes WHERE createdAt < DATEADD(MINUTE, -10, GETDATE())');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error en cleanupExpired:', error);
      throw error;
    }
  }

  async getPool() {
    if (this.sql.constructor.name === 'ConnectionPool') {
      return this.sql;
    }
    return await sql.connect(this.sql);
  }
}

module.exports = VerificationCodeModel;
