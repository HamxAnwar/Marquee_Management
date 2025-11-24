import { api, ApiResponse } from '@/lib/api-client';
import type { Hall, HallListItem } from '@/types';

export interface CreateHallRequest {
  name: string;
  description?: string;
  capacity: number;
  base_price: string;
  location?: string;
  amenities?: string[];
  is_active?: boolean;
}

export interface UpdateHallRequest extends Partial<CreateHallRequest> {
  id: number;
}

export interface HallQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  min_capacity?: number;
  max_capacity?: number;
  ordering?: string;
}

export const hallsApi = {
  // Get all halls with pagination and filters
  getHalls: async (params?: HallQueryParams & { organization?: number }): Promise<ApiResponse<HallListItem>> => {
    // If organization is specified, use marketplace endpoint
    if (params?.organization) {
      const response = await api.get<ApiResponse<HallListItem>>(`/marketplace/${params.organization}/halls/`);
      return response.data;
    }
    // Otherwise use general halls endpoint
    const response = await api.get<ApiResponse<HallListItem>>('/halls/', { params });
    return response.data;
  },

  // Get single hall by ID
  getHall: async (id: number): Promise<Hall> => {
    const response = await api.get<Hall>(`/halls/${id}/`);
    return response.data;
  },

  // Create new hall
  createHall: async (hallData: CreateHallRequest & { organization?: number }): Promise<Hall> => {
    // If organization is specified, the hall will be created for that organization
    // The backend should handle this automatically based on the user's permissions
    const response = await api.post<Hall>('/halls/', hallData);
    return response.data;
  },

  // Update existing hall
  updateHall: async (id: number, hallData: Partial<CreateHallRequest>): Promise<Hall> => {
    const response = await api.patch<Hall>(`/halls/${id}/`, hallData);
    return response.data;
  },

  // Delete hall
  deleteHall: async (id: number): Promise<void> => {
    await api.delete(`/halls/${id}/`);
  },

  // Toggle hall active status
  toggleHallStatus: async (id: number): Promise<Hall> => {
    const response = await api.post<Hall>(`/halls/${id}/toggle-status/`);
    return response.data;
  },

  // Get hall availability for specific date range
  getHallAvailability: async (
    id: number,
    startDate: string,
    endDate: string
  ): Promise<{ is_available: boolean; conflicting_bookings: any[] }> => {
    const response = await api.get<{ is_available: boolean; conflicting_bookings: any[] }>(
      `/halls/${id}/availability/`,
      {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      }
    );
    return response.data;
  },

  // Get hall statistics
  getHallStats: async (id: number): Promise<{
    total_bookings: number;
    revenue: string;
    occupancy_rate: number;
    recent_bookings: any[];
  }> => {
    const response = await api.get(`/halls/${id}/stats/`);
    return response.data;
  },

  // Get active halls (simplified list)
  getActiveHalls: async (): Promise<HallListItem[]> => {
    const response = await api.get<ApiResponse<HallListItem>>('/halls/', {
      params: { is_active: true, page_size: 100 },
    });
    return response.data.results || [];
  },
};

export default hallsApi;