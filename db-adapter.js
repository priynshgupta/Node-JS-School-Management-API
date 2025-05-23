// Database adapter to support both MySQL and PostgreSQL
const mysql = require('mysql2/promise');
const { Pool } = require('pg');
require('dotenv').config();

// Determine which database to use based on environment
const usePg = process.env.USE_PG === 'true' || process.env.NODE_ENV === 'production';

// Database configuration
const getDbConfig = () => {
  if (usePg) {
    // PostgreSQL config (for Render)
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL_ENABLED === 'true' ? { rejectUnauthorized: false } : false
    };
  } else {
    // MySQL config (for local development)
    return {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      port: process.env.DB_PORT || 3306,
      ssl: process.env.DB_SSL_ENABLED === 'true' ? { rejectUnauthorized: false } : false
    };
  }
};

// Database connection
let dbPool = null;

// Initialize database connection
const initializeDb = async () => {
  try {
    if (usePg) {
      console.log('Initializing PostgreSQL connection...');
      dbPool = new Pool(getDbConfig());

      // Test the connection
      const client = await dbPool.connect();
      console.log('PostgreSQL connected successfully');

      // Create schools table if not exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS schools (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address VARCHAR(255) NOT NULL,
          latitude FLOAT NOT NULL,
          longitude FLOAT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Schools table created or already exists');

      client.release();
      return true;
    } else {
      console.log('Initializing MySQL connection...');
      dbPool = await mysql.createPool(getDbConfig());

      // Test the connection
      const connection = await dbPool.getConnection();
      console.log('MySQL connected successfully');

      // Create schools table if not exists
      await connection.query(`
        CREATE TABLE IF NOT EXISTS schools (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address VARCHAR(255) NOT NULL,
          latitude FLOAT NOT NULL,
          longitude FLOAT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Schools table created or already exists');

      connection.release();
      return true;
    }
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Execute query with appropriate database client
const executeQuery = async (query, params = []) => {
  try {
    if (usePg) {
      const result = await dbPool.query(query, params);
      return result.rows;
    } else {
      const [rows] = await dbPool.query(query, params);
      return rows;
    }
  } catch (error) {
    console.error('Query execution failed:', error);
    throw error;
  }
};

// Insert a school and return the inserted row
const insertSchool = async (name, address, latitude, longitude) => {
  try {
    if (usePg) {
      const query = `
        INSERT INTO schools (name, address, latitude, longitude)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const result = await dbPool.query(query, [name, address, latitude, longitude]);
      return result.rows[0];
    } else {
      const query = `
        INSERT INTO schools (name, address, latitude, longitude)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await dbPool.query(query, [name, address, latitude, longitude]);

      // Get the inserted school
      const [rows] = await dbPool.query('SELECT * FROM schools WHERE id = ?', [result.insertId]);
      return rows[0];
    }
  } catch (error) {
    console.error('Failed to insert school:', error);
    throw error;
  }
};

// Get all schools
const getAllSchools = async () => {
  try {
    const query = 'SELECT * FROM schools';
    return await executeQuery(query);
  } catch (error) {
    console.error('Failed to get schools:', error);
    throw error;
  }
};

module.exports = {
  initializeDb,
  executeQuery,
  insertSchool,
  getAllSchools,
  isPostgres: usePg
};
