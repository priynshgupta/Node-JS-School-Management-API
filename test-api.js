// A simple test script to verify API endpoints are working
const http = require('http');

// Test the health endpoint
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET',
};

console.log('Testing health endpoint...');
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('RESPONSE:');
    try {
      const parsedData = JSON.parse(data);
      console.log(JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.log('Raw response:', data);
      console.error('Error parsing JSON:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
