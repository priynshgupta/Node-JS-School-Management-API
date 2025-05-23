const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

// Create express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
let db = null;
let dbConnected = false;
let mockData = [
  { id: 1, name: 'Mock High School', address: '123 Test St', latitude: 40.7128, longitude: -74.0060, created_at: new Date() },
  { id: 2, name: 'Mock Elementary', address: '456 Demo Ave', latitude: 34.0522, longitude: -118.2437, created_at: new Date() }
]; // In-memory storage with sample data when DB is not available

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_management',
  port: process.env.DB_PORT || 3309, // Custom port for your MySQL installation
  connectTimeout: 5000, // 5 second timeout
  ssl: process.env.DB_SSL_ENABLED === 'true' ? {
    rejectUnauthorized: false // Required for SSL connection
  } : false,
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from(process.env.DB_PASSWORD || '')
  }
};

// Connect to database
function connectToDatabase() {
  try {
    console.log('Attempting to connect to MySQL database...');
    db = mysql.createConnection(dbConfig);    db.connect((err) => {
      if (err) {
        console.error('Error connecting to the database:', err.message);
        console.error('Full database error:', err);
        console.log('App is running without database connection. Some features may not work properly.');
        dbConnected = false;
        return;
      }

      dbConnected = true;
      console.log('Connected to MySQL database');

      // Create schools table if not exists
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS schools (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address VARCHAR(255) NOT NULL,
          latitude FLOAT NOT NULL,
          longitude FLOAT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      db.query(createTableQuery, (err, result) => {
        if (err) {
          console.error('Error creating schools table:', err.message);
        } else {
          console.log('Schools table is ready');
        }
      });
    });

    // Handle disconnection
    db.on('error', (err) => {
      console.error('Database error:', err.message);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Database connection lost. Trying to reconnect...');
        connectToDatabase();
      } else {
        throw err;
      }
    });
  } catch (error) {
    console.error('Failed to initialize database connection:', error.message);
    console.log('App is running without database connection. Some features may not work properly.');
    dbConnected = false;
  }
}

// Initialize database connection
connectToDatabase();

// API Routes
// Add School API
app.post('/addSchool', (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Basic validation
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
      errors: ['name, address, latitude, and longitude are required']
    });
  }

  // If database is not connected, use mock data
  if (!dbConnected) {
    console.log('Using mock data for addSchool endpoint');

    const newSchool = {
      id: mockData.length + 1,
      name,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      created_at: new Date()
    };

    mockData.push(newSchool);

    return res.status(201).json({
      success: true,
      message: 'School added successfully (MOCK DATA)',
      data: newSchool
    });
  }

  // Insert into database
  const insertQuery = `
    INSERT INTO schools (name, address, latitude, longitude)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    insertQuery,
    [name, address, parseFloat(latitude), parseFloat(longitude)],
    (err, results) => {
      if (err) {
        console.error('Error adding school:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to add school',
          error: err.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'School added successfully',
        data: { id: results.insertId, name, address, latitude, longitude }
      });
    }
  );
});

// List Schools API
app.get('/listSchools', (req, res) => {
  const { latitude, longitude } = req.query;

  // Basic validation
  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Missing coordinates',
      errors: ['latitude and longitude are required']
    });
  }

  const userLat = parseFloat(latitude);
  const userLng = parseFloat(longitude);

  if (isNaN(userLat) || isNaN(userLng)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates',
      errors: ['latitude and longitude must be valid numbers']
    });
  }

  // If database is not connected, use mock data
  if (!dbConnected) {
    console.log('Using mock data for listSchools endpoint');

    // Calculate distance for each school and sort by proximity
    const schoolsWithDistance = mockData.map(school => {
      // Calculate distance using the Haversine formula
      const distance = calculateDistance(
        userLat, userLng,
        school.latitude, school.longitude
      );

      return { ...school, distance };
    });

    // Sort by distance (ascending)
    schoolsWithDistance.sort((a, b) => a.distance - b.distance);

    return res.status(200).json({
      success: true,
      message: 'Schools retrieved successfully (MOCK DATA)',
      data: schoolsWithDistance
    });
  }

  // Fetch all schools from the database
  db.query('SELECT * FROM schools', (err, results) => {
    if (err) {
      console.error('Error fetching schools:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch schools',
        error: err.message
      });
    }

    // Calculate distance for each school and sort by proximity
    const schoolsWithDistance = results.map(school => {
      // Calculate distance using the Haversine formula
      const distance = calculateDistance(
        userLat, userLng,
        school.latitude, school.longitude
      );

      return { ...school, distance };
    });

    // Sort by distance (ascending)
    schoolsWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      message: 'Schools retrieved successfully',
      data: schoolsWithDistance
    });
  });
});

// Helper function to calculate distance using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'School Management API',
    version: '1.0.0',
    endpoints: [
      {
        path: '/addSchool',
        method: 'POST',
        description: 'Add a new school with name, address, latitude, and longitude'
      },
      {
        path: '/listSchools',
        method: 'GET',
        description: 'List schools sorted by proximity to a user\'s location'
      },
      {
        path: '/health',
        method: 'GET',
        description: 'Check the health status of the API'
      }
    ]
  });
});

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    error: 'Not Found'
  });
});

// Handle errors
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    error: err.message
  });
});

// Export the app for server.js
module.exports = { app, dbConnected };
