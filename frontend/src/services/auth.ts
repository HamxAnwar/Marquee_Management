import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";
import type { UserProfile } from "@/types";

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
    const response = await api.post<LoginResponse>(
      API_ENDPOINTS.AUTH_LOGIN,
      credentials,
    );
    return response.data;
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<UserProfile> => {
    const response = await api.post<UserProfile>(
      API_ENDPOINTS.AUTH_REGISTER,
      userData,
    );
    return response.data;
  },

  // Logout user
  logout: async (refreshToken: string): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH_LOGOUT, { refresh: refreshToken });
  },

  // Get current user profile
  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>(API_ENDPOINTS.AUTH_USER);
    return response.data;
  },

  // Update user profile
  updateProfile: async (
    userData: Partial<UserProfile>,
  ): Promise<UserProfile> => {
    const response = await api.patch<UserProfile>(API_ENDPOINTS.AUTH_USER, userData);
    return response.data;
  },

  // Change password
  changePassword: async (
    passwordData: ChangePasswordRequest,
  ): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH_CHANGE_PASSWORD, passwordData);
  },

  // Request password reset
  resetPassword: async (resetData: ResetPasswordRequest): Promise<void> => {
    await api.post("/api/auth/password-reset/", resetData);
  },

  // Confirm password reset
  resetPasswordConfirm: async (
    confirmData: ResetPasswordConfirmRequest,
  ): Promise<void> => {
    await api.post("/api/auth/password-reset-confirm/", confirmData);
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await api.post<{ access: string }>(
      API_ENDPOINTS.AUTH_REFRESH,
      {
        refresh: refreshToken,
      },
    );
    return response.data;
  },

  // Verify token
  verifyToken: async (token: string): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH_VERIFY, { token });
  },
};

export default authApi;
