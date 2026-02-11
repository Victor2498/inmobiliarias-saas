import axiosInstance from '../../api/axiosInstance';

interface LoginResponse {
    access_token: string;
    token_type: string;
    user: {
        email: string;
        role: string;
        tenant_id: string;
    };
}

export const AuthService = {
    // Unificamos el login ya que el backend usa la misma tabla de usuarios
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const response = await axiosInstance.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    },

    // Mantenemos los nombres para no romper LoginPage pero apuntamos al mismo sitio
    loginTenant: async (email: string, password: string) => AuthService.login(email, password),
    loginAdmin: async (email: string, password: string) => AuthService.login(email, password)
};
