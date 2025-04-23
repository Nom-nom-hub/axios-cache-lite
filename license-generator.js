/**
 * Simple license key generator for axios-cache-lite Pro
 * 
 * This script generates license keys in the format: XXXX-XXXX-XXXX-XXXX
 * You can use this to generate keys manually, or integrate with your
 * license management system.
 */

// Function to generate a random string of specified length
function generateRandomString(length, characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789') {
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

// Generate a license key in the format XXXX-XXXX-XXXX-XXXX
function generateLicenseKey() {
  const segments = [];
  
  for (let i = 0; i < 4; i++) {
    segments.push(generateRandomString(4));
  }
  
  return segments.join('-');
}

// Generate a specified number of license keys
function generateLicenseKeys(count = 1) {
  const keys = [];
  
  for (let i = 0; i < count; i++) {
    keys.push(generateLicenseKey());
  }
  
  return keys;
}

// Example usage
const licenseKeys = generateLicenseKeys(5);
console.log('Generated License Keys:');
licenseKeys.forEach((key, index) => {
  console.log(`${index + 1}. ${key}`);
});

// Export functions for use in other scripts
module.exports = {
  generateLicenseKey,
  generateLicenseKeys
};
