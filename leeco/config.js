// Environment Configuration
// Automatically detects if running locally or in production

const getApiBaseUrl = () => {
  // Check if we're in production (Vercel, Netlify, or any non-localhost domain)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Production: Use relative URL (same domain as frontend)
    return '/api';
  }
  // Local development: Use localhost
  return 'http://localhost:3000/api';
};

// Export configuration
const CONFIG = {
  API_BASE_URL: getApiBaseUrl(),
  IS_PRODUCTION: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
  ENVIRONMENT: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'production' : 'development'
};

// Log environment info (helpful for debugging)
console.log('🌍 Environment:', CONFIG.ENVIRONMENT);
console.log('🔗 API URL:', CONFIG.API_BASE_URL);

// Make it globally available
window.CONFIG = CONFIG;
