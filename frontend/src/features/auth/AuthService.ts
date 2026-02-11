import axiosInstance from '../../api/axiosInstance';

interface LoginResponse {
    access_token: string;
    token_type: string;
    user: {
        email: string;
        role: string;
        tenant_id: string;
        name?: string;
        plan?: string;
        whatsapp_enabled?: boolean;
        preferences?: any;
    };
}

export const AuthService = {
    loginTenant: async (nombre_inmobiliaria: string, password: string): Promise<LoginResponse> => {
        const response = await axiosInstance.post('/auth/login/tenant', {
            nombre_inmobiliaria,
            password
        });
        return response.data;
    },

    loginAdmin: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await axiosInstance.post('/auth/login/admin', {
            email,
            password
        });
        return response.data;
    }
};
