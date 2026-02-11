import axiosInstance from '../../api/axiosInstance';

export interface Charge {
    id: number;
    description: string;
    amount: number;
    due_date: string;
    is_paid: boolean;
    contract_id: number;
}

export const ChargeService = {
    list: async () => {
        const response = await axiosInstance.get<Charge[]>('/contracts/charges');
        return response.data;
    },
    getPaymentPreference: async (chargeId: number) => {
        const response = await axiosInstance.get<{ init_point: string }>(`/payments/preference/charge/${chargeId}`);
        return response.data;
    }
};
