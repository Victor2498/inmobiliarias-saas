import axiosInstance from '../../api/axiosInstance';

export const WhatsAppService = {
    getSessions: async () => {
        const response = await axiosInstance.get('/whatsapp/sessions');
        return response.data;
    },
    createSession: async (instanceName: string) => {
        const response = await axiosInstance.post(`/whatsapp/sessions/create?instance_name=${instanceName}`);
        return response.data;
    }
};
