// This script ensures database is initialized properly on Render
require('dotenv').config();
const dbAdapter = require('./db-adapter');

async function initializeDatabase() {
  console.log('Initializing database on Render...');

  try {
    // Initialize database connection
    const connected = await dbAdapter.initializeDb();

    if (connected) {
      console.log('Database connection established successfully');
    } else {
      console.error('Failed to connect to database');
    }    // Start the server
    console.log('Starting the server...');
    require('./server-pg');
  } catch (error) {
    console.error('Error initializing database:', error);
    console.log('Starting server without database initialization...');

    // Start the server anyway
    require('./server-pg');
  }
}

// Run the initialization
initializeDatabase();
