// This script ensures database is initialized properly on Render
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  console.log('Initializing database on Render...');

  try {
    // Database connection configuration
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      ssl: process.env.DB_SSL_ENABLED === 'true' ? {
        rejectUnauthorized: false
      } : false
    };

    console.log(`Connecting to MySQL at ${dbConfig.host}:${dbConfig.port}...`);

    // Connect without database selected
    const connection = await mysql.createConnection(dbConfig);

    // Create database if not exists
    console.log('Creating database if not exists...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'school_management'}`);

    // Use the database
    console.log(`Using database ${process.env.DB_NAME || 'school_management'}...`);
    await connection.query(`USE ${process.env.DB_NAME || 'school_management'}`);

    // Create schools table if not exists
    console.log('Creating schools table if not exists...');
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

    console.log('Database initialization completed successfully.');

    // Close the connection
    await connection.end();

    // Start the server
    require('./server');
  } catch (error) {
    console.error('Error initializing database:', error);
    console.log('Starting server without database initialization...');

    // Start the server anyway
    require('./server');
  }
}

// Run the initialization
initializeDatabase();
