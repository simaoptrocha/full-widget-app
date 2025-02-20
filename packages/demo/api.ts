import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5173', // Update to match your Next.js server URL
  withCredentials: true, // Ensure cookies are sent with requests
});

export default api;
