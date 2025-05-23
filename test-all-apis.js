// Test script for addSchool and listSchools endpoints
const http = require('http');

// Function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (e) {
          reject(new Error(`Error parsing response: ${e.message}, raw data: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }

    req.end();
  });
}

// Test function
async function runTests() {
  try {
    console.log('Testing API endpoints...\n');

    // 1. Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET',
    });

    console.log(`Status: ${healthResponse.statusCode}`);
    console.log('Response:', JSON.stringify(healthResponse.data, null, 2));
    console.log('\n-----------------------------------\n');

    // 2. Test addSchool endpoint
    console.log('2. Testing addSchool endpoint...');
    const schoolData = {
      name: 'Test High School',
      address: '123 API Test Road',
      latitude: 37.7749,
      longitude: -122.4194
    };

    const addSchoolResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/addSchool',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, schoolData);

    console.log(`Status: ${addSchoolResponse.statusCode}`);
    console.log('Response:', JSON.stringify(addSchoolResponse.data, null, 2));
    console.log('\n-----------------------------------\n');

    // 3. Test listSchools endpoint
    console.log('3. Testing listSchools endpoint...');
    const listSchoolsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/listSchools?latitude=37.7749&longitude=-122.4194',
      method: 'GET',
    });

    console.log(`Status: ${listSchoolsResponse.statusCode}`);
    console.log('Response:', JSON.stringify(listSchoolsResponse.data, null, 2));

    console.log('\n-----------------------------------\n');
    console.log('All tests completed!');

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Run the tests
runTests();
