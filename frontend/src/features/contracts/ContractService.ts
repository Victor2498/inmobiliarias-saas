import axiosInstance from '../../api/axiosInstance';

export interface Contract {
    id?: number;
    property_id: number;
    person_id: number;
    start_date: string;
    end_date: string;
    monthly_rent: number;
    currency: string;
    adjustment_period: number;
    status: string;
}

export const ContractService = {
    list: async () => {
        const response = await axiosInstance.get<Contract[]>('/contracts/');
        return response.data;
    },
    create: async (data: Contract) => {
        const response = await axiosInstance.post<Contract>('/contracts/', data);
        return response.data;
    }
};
