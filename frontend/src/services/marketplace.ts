import { api, ApiResponse } from '@/lib/api-client';
import type { Organization } from '@/types';

export interface MarketplaceQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  city?: string;
  ordering?: string;
}

export const marketplaceApi = {
  // Get all organizations for marketplace
  getOrganizations: async (params?: MarketplaceQueryParams): Promise<ApiResponse<Organization>> => {
    const response = await api.get<ApiResponse<Organization>>('/api/marketplace/', { params });
    return response.data;
  },

  // Get single organization details
  getOrganization: async (id: number): Promise<Organization> => {
    const response = await api.get<Organization>(`/api/marketplace/${id}/`);
    return response.data;
  },

  // Get organization halls
  getOrganizationHalls: async (organizationId: number): Promise<any[]> => {
    const response = await api.get(`/api/marketplace/${organizationId}/halls/`);
    return response.data.results || response.data;
  },
};

export default marketplaceApi;