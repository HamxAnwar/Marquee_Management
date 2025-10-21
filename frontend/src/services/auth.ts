import { api } from '@/lib/api-client';
import type { UserProfile } from '@/types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: UserProfile;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  uid: string;
  token: string;
  new_password: string;
}

export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login/', credentials);
    return response.data;
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<UserProfile> => {
    const response = await api.post<UserProfile>('/api/auth/register/', userData);
    return response.data;
  },

  // Logout user
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/api/auth/logout/', { refresh: refreshToken });
  },

  // Get current user profile
  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/api/auth/user/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.patch<UserProfile>('/api/auth/user/', userData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData: ChangePasswordRequest): Promise<void> => {
    await api.post('/api/auth/change-password/', passwordData);
  },

  // Request password reset
  resetPassword: async (resetData: ResetPasswordRequest): Promise<void> => {
    await api.post('/api/auth/password-reset/', resetData);
  },

  // Confirm password reset
  resetPasswordConfirm: async (confirmData: ResetPasswordConfirmRequest): Promise<void> => {
    await api.post('/api/auth/password-reset-confirm/', confirmData);
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await api.post<{ access: string }>('/api/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  // Verify token
  verifyToken: async (token: string): Promise<void> => {
    await api.post('/api/auth/token/verify/', { token });
  },
};

export default authApi;