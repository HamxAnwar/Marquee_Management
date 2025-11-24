import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { apiClient } from "@/services/api";
import type { PlatformStats, PlatformSettings, BulkActionResponse } from "@/types";

// Get platform stats
export const usePlatformStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PLATFORM_STATS,
    queryFn: apiClient.getPlatformStats,
  });
};

// Get platform settings
export const usePlatformSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PLATFORM_SETTINGS,
    queryFn: apiClient.getPlatformSettings,
  });
};

// Update platform settings
export const useUpdatePlatformSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PlatformSettings>) =>
      apiClient.updatePlatformSettings(data),
    onSuccess: (data) => {
      // Update settings in cache
      queryClient.setQueryData(QUERY_KEYS.PLATFORM_SETTINGS, data);
    },
  });
};

// Get pending organizations
export const usePendingOrganizations = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PLATFORM_PENDING,
    queryFn: apiClient.getPendingOrganizations,
  });
};

// Bulk approve organizations
export const useBulkApproveOrganizations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationIds: number[]) =>
      apiClient.bulkApproveOrganizations(organizationIds),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLATFORM_STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLATFORM_PENDING });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MARKETPLACE });
    },
  });
};

// Bulk suspend organizations
export const useBulkSuspendOrganizations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationIds, reason }: { organizationIds: number[]; reason?: string }) =>
      apiClient.bulkSuspendOrganizations(organizationIds, reason),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLATFORM_STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLATFORM_PENDING });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MARKETPLACE });
    },
  });
};