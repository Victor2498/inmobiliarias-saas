import axiosInstance from '../../api/axiosInstance';

export interface LiquidationItem {
    id: number;
    concept_name: string;
    description?: string;
    current_value: number;
    previous_value: number;
    adjustment_applied: boolean;
    adjustment_percentage: number;
}

export interface Liquidation {
    id: number;
    period: string;
    due_date: string;
    total_amount: number;
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    contract_id: number;
    items: LiquidationItem[];
}

export interface LiquidationCreate {
    contract_id: number;
    period: string; // MM/YYYY
    due_date: string; // ISO Date
}

export const LiquidationService = {
    createDraft: async (data: LiquidationCreate) => {
        const response = await axiosInstance.post<Liquidation>('/liquidations/', data);
        return response.data;
    },
    get: async (id: number) => {
        const response = await axiosInstance.get<Liquidation>(`/liquidations/${id}`);
        return response.data;
    },
    confirm: async (id: number) => {
        const response = await axiosInstance.post<Liquidation>(`/liquidations/${id}/confirm`);
        return response.data;
    }
};
