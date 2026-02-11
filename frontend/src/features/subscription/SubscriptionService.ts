import axiosInstance from '../../api/axiosInstance';

export const SubscriptionService = {
    getUpgradePreference: async (plan: string) => {
        const response = await axiosInstance.post<{ init_point: string }>('/payments/upgrade-plan', null, {
            params: { new_plan: plan }
        });
        return response.data;
    }
};
