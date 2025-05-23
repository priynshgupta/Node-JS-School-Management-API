// Server entry point
require('dotenv').config();

// Determine which app file to use based on environment
const isProd = process.env.NODE_ENV === 'production';
const appModule = isProd ? './app-pg' : './app';

console.log(`Loading app module: ${appModule} (${isProd ? 'production' : 'development'} mode)`);

const { app } = require(appModule);

// Set port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
