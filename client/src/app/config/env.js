export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:5000',
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  IS_DEV: import.meta.env.VITE_NODE_ENV === 'development',
  IS_PROD: import.meta.env.VITE_NODE_ENV === 'production',
};

export default env;