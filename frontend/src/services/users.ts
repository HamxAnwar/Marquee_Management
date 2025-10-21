import { api, ApiResponse } from '@/lib/api-client';
import type { UserProfile } from '@/types';

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: 'admin' | 'manager' | 'staff' | 'customer';
  is_active?: boolean;
}

export interface UpdateUserRequest extends Partial<Omit<CreateUserRequest, 'password'>> {
  id: number;
}

export interface UserQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
  ordering?: string;
}

export interface UserStatsResponse {
  total_users: number;
  active_users: number;
  admin_users: number;
  manager_users: number;
  staff_users: number;
  customer_users: number;
  recent_registrations: {
    date: string;
    count: number;
  }[];
}

export const usersApi = {
  // Get all users with pagination and filters
  getUsers: async (params?: UserQueryParams): Promise<ApiResponse<UserProfile>> => {
    const response = await api.get<ApiResponse<UserProfile>>('/users/', { params });
    return response.data;
  },

  // Get single user by ID
  getUser: async (id: number): Promise<UserProfile> => {
    const response = await api.get<UserProfile>(`/users/${id}/`);
    return response.data;
  },

  // Create new user
  createUser: async (userData: CreateUserRequest): Promise<UserProfile> => {
    const response = await api.post<UserProfile>('/users/', userData);
    return response.data;
  },

  // Update existing user
  updateUser: async (id: number, userData: Partial<CreateUserRequest>): Promise<UserProfile> => {
    const response = await api.patch<UserProfile>(`/users/${id}/`, userData);
    return response.data;
  },

  // Delete user (soft delete - deactivate)
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}/`);
  },

  // Toggle user active status
  toggleUserStatus: async (id: number): Promise<UserProfile> => {
    const response = await api.post<UserProfile>(`/users/${id}/toggle-status/`);
    return response.data;
  },

  // Activate user
  activateUser: async (id: number): Promise<UserProfile> => {
    const response = await api.post<UserProfile>(`/users/${id}/activate/`);
    return response.data;
  },

  // Deactivate user
  deactivateUser: async (id: number): Promise<UserProfile> => {
    const response = await api.post<UserProfile>(`/users/${id}/deactivate/`);
    return response.data;
  },

  // Change user role
  changeUserRole: async (id: number, role: string): Promise<UserProfile> => {
    const response = await api.patch<UserProfile>(`/users/${id}/`, { role });
    return response.data;
  },

  // Reset user password (admin only)
  resetUserPassword: async (id: number): Promise<{ password: string }> => {
    const response = await api.post<{ password: string }>(`/users/${id}/reset-password/`);
    return response.data;
  },

  // Get users by role
  getUsersByRole: async (role: string): Promise<UserProfile[]> => {
    const response = await api.get<ApiResponse<UserProfile>>('/users/', {
      params: { role, page_size: 100 },
    });
    return response.data.results || [];
  },

  // Get active users
  getActiveUsers: async (): Promise<UserProfile[]> => {
    const response = await api.get<ApiResponse<UserProfile>>('/users/', {
      params: { is_active: true, page_size: 100 },
    });
    return response.data.results || [];
  },

  // Get staff users (managers and staff)
  getStaffUsers: async (): Promise<UserProfile[]> => {
    const response = await api.get<ApiResponse<UserProfile>>('/users/staff/', {
      params: { page_size: 100 },
    });
    return response.data.results || [];
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStatsResponse> => {
    const response = await api.get<UserStatsResponse>('/users/stats/');
    return response.data;
  },

  // Get user activity log
  getUserActivity: async (userId: number, limit: number = 50): Promise<{
    id: number;
    action: string;
    timestamp: string;
    details?: string;
  }[]> => {
    const response = await api.get(`/users/${userId}/activity/`, {
      params: { limit },
    });
    return response.data.results || [];
  },

  // Search users
  searchUsers: async (query: string): Promise<UserProfile[]> => {
    const response = await api.get<ApiResponse<UserProfile>>('/users/', {
      params: { search: query, page_size: 20 },
    });
    return response.data.results || [];
  },

  // Bulk operations
  bulkUpdateStatus: async (userIds: number[], isActive: boolean): Promise<void> => {
    await api.post('/users/bulk-update-status/', {
      user_ids: userIds,
      is_active: isActive,
    });
  },

  bulkUpdateRole: async (userIds: number[], role: string): Promise<void> => {
    await api.post('/users/bulk-update-role/', {
      user_ids: userIds,
      role,
    });
  },

  // Export users
  exportUsers: async (params?: UserQueryParams): Promise<Blob> => {
    const response = await api.get('/users/export/', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Send welcome email to new user
  sendWelcomeEmail: async (userId: number): Promise<void> => {
    await api.post(`/users/${userId}/send-welcome-email/`);
  },

  // Send password reset email
  sendPasswordResetEmail: async (userId: number): Promise<void> => {
    await api.post(`/users/${userId}/send-password-reset/`);
  },

  // Get user permissions
  getUserPermissions: async (userId: number): Promise<string[]> => {
    const response = await api.get<{ permissions: string[] }>(`/users/${userId}/permissions/`);
    return response.data.permissions;
  },

  // Update user permissions
  updateUserPermissions: async (userId: number, permissions: string[]): Promise<void> => {
    await api.post(`/users/${userId}/permissions/`, { permissions });
  },
};

export default usersApi;