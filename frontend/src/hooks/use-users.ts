import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  usersApi, 
  type CreateUserRequest, 
  type UserQueryParams 
} from '@/services/users';
import { queryKeys } from '@/lib/react-query';

// Get users with pagination and filters
export const useUsers = (params?: UserQueryParams) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersApi.getUsers(params),
  });
};

// Get single user
export const useUser = (id: number) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.getUser(id),
    enabled: !!id,
  });
};

// Get users by role
export const useUsersByRole = (role: string) => {
  return useQuery({
    queryKey: queryKeys.users.list({ role }),
    queryFn: () => usersApi.getUsersByRole(role),
    enabled: !!role,
  });
};

// Get active users
export const useActiveUsers = () => {
  return useQuery({
    queryKey: queryKeys.users.list({ is_active: true }),
    queryFn: () => usersApi.getActiveUsers(),
  });
};

// Get staff users
export const useStaffUsers = () => {
  return useQuery({
    queryKey: [...queryKeys.users.lists(), 'staff'],
    queryFn: () => usersApi.getStaffUsers(),
  });
};

// Get user statistics
export const useUserStats = () => {
  return useQuery({
    queryKey: queryKeys.users.stats,
    queryFn: () => usersApi.getUserStats(),
  });
};

// Get user activity
export const useUserActivity = (userId: number, limit: number = 50) => {
  return useQuery({
    queryKey: [...queryKeys.users.activity(userId), limit],
    queryFn: () => usersApi.getUserActivity(userId, limit),
    enabled: !!userId,
  });
};

// Get user permissions
export const useUserPermissions = (userId: number) => {
  return useQuery({
    queryKey: queryKeys.users.permissions(userId),
    queryFn: () => usersApi.getUserPermissions(userId),
    enabled: !!userId,
  });
};

// Search users
export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: [...queryKeys.users.lists(), 'search', query],
    queryFn: () => usersApi.searchUsers(query),
    enabled: !!query && query.length > 2,
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => usersApi.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats });
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateUserRequest> }) =>
      usersApi.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats });
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats });
    },
  });
};

// Toggle user status mutation
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.toggleUserStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats });
    },
  });
};

// Activate user mutation
export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.activateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats });
    },
  });
};

// Deactivate user mutation
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.deactivateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats });
    },
  });
};

// Change user role mutation
export const useChangeUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      usersApi.changeUserRole(id, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats });
    },
  });
};

// Reset user password mutation
export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: (id: number) => usersApi.resetUserPassword(id),
  });
};

// Update user permissions mutation
export const useUpdateUserPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, permissions }: { userId: number; permissions: string[] }) =>
      usersApi.updateUserPermissions(userId, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.users.permissions(variables.userId) 
      });
    },
  });
};

// Bulk update status mutation
export const useBulkUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, isActive }: { userIds: number[]; isActive: boolean }) =>
      usersApi.bulkUpdateStatus(userIds, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats });
    },
  });
};

// Bulk update role mutation
export const useBulkUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, role }: { userIds: number[]; role: string }) =>
      usersApi.bulkUpdateRole(userIds, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats });
    },
  });
};

// Export users mutation
export const useExportUsers = () => {
  return useMutation({
    mutationFn: (params?: UserQueryParams) => usersApi.exportUsers(params),
  });
};

// Send welcome email mutation
export const useSendWelcomeEmail = () => {
  return useMutation({
    mutationFn: (userId: number) => usersApi.sendWelcomeEmail(userId),
  });
};

// Send password reset email mutation
export const useSendPasswordResetEmail = () => {
  return useMutation({
    mutationFn: (userId: number) => usersApi.sendPasswordResetEmail(userId),
  });
};