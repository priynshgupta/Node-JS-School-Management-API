/**
 * Validates school data for adding a new school
 * @param {Object} data - The school data to validate
 * @returns {Object} - Contains isValid flag and any error messages
 */
function validateSchoolData(data) {
  const errors = [];

  // Check for required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!data.address || typeof data.address !== 'string' || data.address.trim() === '') {
    errors.push('Address is required and must be a non-empty string');
  }

  // Check if latitude and longitude are defined
  if (data.latitude === undefined || data.latitude === null) {
    errors.push('Latitude is required');
  }

  if (data.longitude === undefined || data.longitude === null) {
    errors.push('Longitude is required');
  }

  // Check that latitude and longitude are valid numbers
  const lat = parseFloat(data.latitude);
  const lng = parseFloat(data.longitude);

  if (isNaN(lat)) {
    errors.push('Latitude must be a valid number');
  } else if (lat < -90 || lat > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (isNaN(lng)) {
    errors.push('Longitude must be a valid number');
  } else if (lng < -180 || lng > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validates coordinates for the listSchools endpoint
 * @param {Object} coords - The coordinates to validate
 * @returns {Object} - Contains isValid flag and any error messages
 */
function validateCoordinates(coords) {
  const errors = [];

  // Check if latitude and longitude are defined
  if (coords.latitude === undefined || coords.latitude === null) {
    errors.push('Latitude parameter is required');
  }

  if (coords.longitude === undefined || coords.longitude === null) {
    errors.push('Longitude parameter is required');
  }

  // Parse and check latitude and longitude
  const lat = parseFloat(coords.latitude);
  const lng = parseFloat(coords.longitude);

  if (isNaN(lat)) {
    errors.push('Latitude must be a valid number');
  } else if (lat < -90 || lat > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (isNaN(lng)) {
    errors.push('Longitude must be a valid number');
  } else if (lng < -180 || lng > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

module.exports = {
  validateSchoolData,
  validateCoordinates
};
