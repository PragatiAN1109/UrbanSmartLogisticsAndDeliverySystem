import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5002', // Backend server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
