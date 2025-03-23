import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.VUE_APP_API_BASE || 'http://localhost:8081/api',
    timeout: 300000,
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.VUE_APP_API_KEY
    }
});

export default apiClient;