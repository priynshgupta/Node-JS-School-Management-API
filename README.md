# Simplified School Management API

A streamlined version of the School Management API with just the core functionality. This version simplifies the original complex implementation to focus on the core features without the overhead of authentication, caching, and other advanced features.

## Features

- Add schools with location information
- List schools sorted by proximity to a given location
- Health check endpoint
- Automatic fallback to in-memory storage when database is unavailable

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MySQL database (v8+ recommended)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables (see below)
4. Run the server: `npm run simple`
3. Configure the database:
   - Create a MySQL database (you can use the `simple_database_setup.sql` script)
   - Update the `.env` file with your database credentials

### Database Setup

#### Using MySQL Workbench

1. Open MySQL Workbench and connect to your MySQL server
2. Make sure you're using the correct port (default is 3306, but your connection uses port 3309)
3. The application will automatically create the database and tables if they don't exist

#### Alternative: Manual Setup

You can also run the following commands to set up your database:

```bash
mysql -u root -p < simple_database_setup.sql
```

Or connect to MySQL and run the commands in the SQL file manually.

### Start the Application

To run the simplified version:

```bash
# Development mode with auto-reload
npm run simple:dev

# Production mode
npm run simple
```

## API Endpoints

### Add a School

```
POST /addSchool
```

Request body:
```json
{
  "name": "School Name",
  "address": "School Address",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### List Schools by Proximity

```
GET /listSchools?latitude=40.7128&longitude=-74.0060
```

### Health Check

```
GET /health
```

## Environment Variables

Configure these in the `.env` file:

- `PORT`: Server port (default: 3000)
- `DB_HOST`: MySQL host (default: localhost)
- `DB_USER`: MySQL username (default: root)
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name (default: school_management)
- `DB_PORT`: MySQL port (default: 3306, your setup uses 3309)
- `DB_SSL_ENABLED`: Enable SSL for DB connection (true/false)

## Testing the API

### Using the Test Scripts

We've included two test scripts to help verify your installation:

1. Basic health check: `node test-api.js`
2. Full API test: `node test-all-apis.js`

### Using Postman

You can also test the API using Postman. Import the provided collection file `simple-postman-collection.json`.

## Mock Mode

If the database is not available, the API will automatically switch to "mock mode" which uses in-memory storage. This is useful for development and testing when you don't have a database available.

## Troubleshooting

### Database Connection Issues

If you're having trouble connecting to the database:

1. Ensure MySQL is installed and running
2. Verify your database credentials in the `.env` file
3. Check that you're using the correct port (your setup uses port 3309)
4. Make sure the database exists (run the setup SQL)
5. If using MySQL 8+, ensure the authentication plugin is compatible with the mysql2 client
4. Check the server logs for specific error messages
