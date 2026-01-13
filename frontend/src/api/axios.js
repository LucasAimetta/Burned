import axios from 'axios';

const api = axios.create({
baseURL: 'https://burned.onrender.com',
});

// Esto es para que todas las peticiones incluyan el Token si el usuario ya se logueó
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;