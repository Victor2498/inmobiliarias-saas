import axiosInstance from '../../api/axiosInstance';

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: {
        email: string;
        role: string;
        tenant_id: string;
        name?: string;
        preferences?: {
            theme: 'light' | 'dark';
        };
    };
}

export const AuthService = {
    loginTenant: async (nombre_inmobiliaria: string, password: string): Promise<LoginResponse> => {
        const response = await axiosInstance.post<LoginResponse>('/auth/login/tenant', {
            nombre_inmobiliaria,
            password,
        });
        return response.data;
    },

    loginAdmin: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await axiosInstance.post<LoginResponse>('/auth/login/admin', {
            email,
            password,
        });
        return response.data;
    },
};
