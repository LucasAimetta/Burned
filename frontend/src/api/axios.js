import axios from 'axios';

const api = axios.create({
  // Lógica inteligente:
  // 1. Si existe la variable de entorno (en Render), usa esa.
  // 2. Si no existe (en tu PC), usa localhost.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  withCredentials: true
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