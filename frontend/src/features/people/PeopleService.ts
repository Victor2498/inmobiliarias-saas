import axiosInstance from '../../api/axiosInstance';

export interface Person {
    id?: number;
    full_name: string;
    dni_cuit: string;
    email?: string;
    phone?: string;
    address?: string;
    type: string;
}

export const PeopleService = {
    list: async (type?: string) => {
        const url = type ? `/people/?type=${type}` : '/people/';
        const response = await axiosInstance.get<Person[]>(url);
        return response.data;
    },
    create: async (data: Person) => {
        const response = await axiosInstance.post<Person>('/people/', data);
        return response.data;
    }
};
