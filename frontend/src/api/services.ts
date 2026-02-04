import api from './client';

export interface Contract {
  id: number;
  tenant_id: number;
  property_id: number;
  current_amount: number;
  status: string;
}

export interface DashboardMetrics {
  activeContracts: number;
  monthlyIncome: number;
  pendingPayments: number;
}

export const ContractService = {
  getAll: async () => {
    const response = await api.get<Contract[]>('/contracts/');
    return response.data;
  },

  // Mock function to calculate metrics from raw data (since we don't have a specific metrics endpoint yet)
  getMetrics: async () => {
    const contracts = await ContractService.getAll();
    const activeContracts = contracts.filter(c => c.status === 'active').length;

    // Sum of current amounts of active contracts
    const monthlyIncome = contracts
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + c.current_amount, 0);

    // TODO: Fetch real pending payments count
    const pendingPayments = 0;

    return {
      activeContracts,
      monthlyIncome,
      pendingPayments
    };
  }
};
export interface Property {
  id: number;
  address: string;
  city: string;
  type: string;
  status: string;
  price: number;
  owner_name: string;
  agency_id: number;
  image_url?: string;
}

export const PropertyService = {
  getAll: async () => {
    const response = await api.get<Property[]>('/properties/');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post<Property>('/properties/', data);
    return response.data;
  }
};
export interface Tenant {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  dni: string;
  address: string;
  agency_id: number;
  unique_link_token: string;
}

export const TenantService = {
  getAll: async () => {
    const response = await api.get<Tenant[]>('/tenants/');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post<Tenant>('/tenants/', data);
    return response.data;
  }
};
