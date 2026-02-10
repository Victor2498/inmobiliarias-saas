import axiosInstance from '../../api/axiosInstance';

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: {
        email: string;
        role: string;
        tenant_id: string;
    };
}

export const AuthService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const formData = new FormData();
        formData.append('username', email); // OAuth2PasswordRequestForm espera 'username'
        formData.append('password', password);

        const response = await axiosInstance.post<LoginResponse>('/auth/login', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
