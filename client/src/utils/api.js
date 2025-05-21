import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for handling authentication in the future
api.interceptors.request.use(
  (config) => {
    // Future authentication token handling can go here
    console.log(`שולח בקשה ל: ${config.baseURL}${config.url}`, config.method);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log(`תגובה מהשרת: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    // Handle specific error responses
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error('API Error:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
      console.error('No response received from server. Check if server is running.');
    } else {
      // Something else happened while setting up the request
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 