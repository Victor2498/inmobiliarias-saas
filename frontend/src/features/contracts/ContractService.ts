import axiosInstance from '../../api/axiosInstance';

export interface Contract {
    id?: number;
    property_id: number;
    person_id: number;
    start_date: string;
    end_date: string;
    monthly_rent: number;
    currency: string;
    adjustment_type: string;
    adjustment_period: number;
    base_amount?: number;
    current_rent?: number;
    last_adjustment_date?: string | null;
    next_expiration_notification_sent?: boolean;
    status: string;
}

export const ContractService = {
    list: async () => {
        const response = await axiosInstance.get<Contract[]>('/contracts/');
        return response.data;
    },
    get: async (id: number) => {
        const response = await axiosInstance.get<Contract>(`/contracts/${id}`);
        return response.data;
    },
    create: async (data: Contract) => {
        const response = await axiosInstance.post<Contract>('/contracts/', data);
        return response.data;
    },
    update: async (id: number, data: Partial<Contract>) => {
        const response = await axiosInstance.put<Contract>(`/contracts/${id}`, data);
        return response.data;
    },
    generateMonthlyCharges: async (month: number, year: number) => {
        const response = await axiosInstance.post('/contracts/generate-monthly-charges', null, {
            params: { month, year }
        });
        return response.data;
    },
    previewAdjustment: async (id: number) => {
        const response = await axiosInstance.get<{ new_amount: number; percentage_increase: number }>(`/contracts/${id}/preview-adjustment`);
        return response.data;
    },
    getAdjustmentsThisMonth: async () => {
        const response = await axiosInstance.get<Contract[]>('/contracts/adjustments-this-month');
        return response.data;
    }
};
