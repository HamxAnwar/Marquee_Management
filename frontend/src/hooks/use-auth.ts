import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi, type LoginRequest, type RegisterRequest, type ChangePasswordRequest } from '@/services/auth';
import { setAuthToken, setRefreshToken, removeTokens, getAuthToken } from '@/lib/api-client';
import { queryKeys } from '@/lib/react-query';
import type { UserProfile } from '@/types';

// Get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: authApi.getCurrentUser,
    retry: false,
    enabled: !!getAuthToken(), // Only run if we have a token
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      // Store tokens
      setAuthToken(data.access);
      setRefreshToken(data.refresh);
      
      // Set user data in cache
      queryClient.setQueryData(queryKeys.auth.user, data.user);
      
      // Redirect to admin dashboard
      router.push('/admin');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (refreshToken: string) => authApi.logout(refreshToken),
    onSuccess: () => {
      // Clear tokens and cache
      removeTokens();
      queryClient.clear();
      
      // Redirect to login
      router.push('/admin/login');
    },
    onError: () => {
      // Even if logout fails on server, clear local data
      removeTokens();
      queryClient.clear();
      router.push('/admin/login');
    },
  });
};

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authApi.register(userData),
    onSuccess: (data) => {
      // Invalidate users list if we're registering from admin
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: Partial<UserProfile>) => authApi.updateProfile(userData),
    onSuccess: (data) => {
      // Update user data in cache
      queryClient.setQueryData(queryKeys.auth.user, data);
    },
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (passwordData: ChangePasswordRequest) => authApi.changePassword(passwordData),
  });
};

// Reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.resetPassword({ email }),
  });
};

// Auth helper hooks
export const useAuthCheck = () => {
  const { data: user, isLoading, error } = useCurrentUser();
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    isError: !!error,
  };
};

// Hook to check if user has specific role
export const useHasRole = (roles: string | string[]) => {
  const { user } = useAuthCheck();
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return user ? roleArray.includes(user.role) : false;
};

// Hook to check if user has admin privileges
export const useIsAdmin = () => {
  return useHasRole(['admin']);
};

// Hook to check if user has manager privileges
export const useIsManager = () => {
  return useHasRole(['admin', 'manager']);
};

// Hook to check if user has staff privileges
export const useIsStaff = () => {
  return useHasRole(['admin', 'manager', 'staff']);
};