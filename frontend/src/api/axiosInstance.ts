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

export default axiosInstance;
