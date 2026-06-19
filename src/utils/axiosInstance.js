import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    withCredentials: true, // CRITICAL: This allows cookies to be sent and received
});

export default axiosInstance;