import axiosInstance from '../../api/axiosInstance';

export interface Property {
    id?: number;
    title: string;
    description: string;
    price: number;
    currency: string;
    address: string;
    features?: any;
    status: string;
}

export const PropertyService = {
    list: async () => {
        const response = await axiosInstance.get<Property[]>('/properties/');
        return response.data;
    },
    get: async (id: number) => {
        const response = await axiosInstance.get<Property>(`/properties/${id}`);
        return response.data;
    },
    create: async (data: Property) => {
        const response = await axiosInstance.post<Property>('/properties/', data);
        return response.data;
    },
    update: async (id: number, data: Partial<Property>) => {
        const response = await axiosInstance.put<Property>(`/properties/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await axiosInstance.delete(`/properties/${id}`);
    }
};
