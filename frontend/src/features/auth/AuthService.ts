import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

interface LoginResponse {
    access_token: string;
    token_type: string;
    user: {
        email: string;
        role: string;
        tenant_id: string;
        name: string;
        plan: string;
        whatsapp_enabled: boolean;
        preferences: any;
    };
}

export const AuthService = {
    loginTenant: async (data: any): Promise<LoginResponse> => {
        const response = await axios.post(`${API_URL}/auth/login/tenant`, data);
        return response.data;
    },

    loginAdmin: async (data: any): Promise<LoginResponse> => {
        const response = await axios.post(`${API_URL}/auth/login/admin`, data);
        return response.data;
    }
};
