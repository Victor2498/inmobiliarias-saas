import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});

axiosInstance.interceptors.request.use((config) => {
    const { token, user } = useAuthStore.getState();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (user?.tenant_id) {
        config.headers['X-Tenant-ID'] = user.tenant_id;
    }

    return config;
});

// Interceptor de respuesta para manejar sesiones expiradas
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const { logout } = useAuthStore.getState();
            logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
