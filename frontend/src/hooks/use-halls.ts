import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hallsApi, type CreateHallRequest, type HallQueryParams } from '@/services/halls';
import { queryKeys } from '@/lib/react-query';

// Get halls with pagination and filters
export const useHalls = (params?: HallQueryParams) => {
  return useQuery({
    queryKey: queryKeys.halls.list(params),
    queryFn: () => hallsApi.getHalls(params),
  });
};

// Get single hall
export const useHall = (id: number) => {
  return useQuery({
    queryKey: queryKeys.halls.detail(id),
    queryFn: () => hallsApi.getHall(id),
    enabled: !!id,
  });
};

// Get active halls (simplified list)
export const useActiveHalls = () => {
  return useQuery({
    queryKey: queryKeys.halls.list({ is_active: true }),
    queryFn: () => hallsApi.getActiveHalls(),
  });
};

// Get hall statistics
export const useHallStats = (id: number) => {
  return useQuery({
    queryKey: queryKeys.halls.stats(id),
    queryFn: () => hallsApi.getHallStats(id),
    enabled: !!id,
  });
};

// Get hall availability
export const useHallAvailability = (id: number, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: [...queryKeys.halls.availability(id), startDate, endDate],
    queryFn: () => hallsApi.getHallAvailability(id, startDate!, endDate!),
    enabled: !!id && !!startDate && !!endDate,
  });
};

// Create hall mutation
export const useCreateHall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (hallData: CreateHallRequest) => hallsApi.createHall(hallData),
    onSuccess: () => {
      // Invalidate halls list
      queryClient.invalidateQueries({ queryKey: queryKeys.halls.lists() });
    },
  });
};

// Update hall mutation
export const useUpdateHall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateHallRequest> }) =>
      hallsApi.updateHall(id, data),
    onSuccess: (_, variables) => {
      // Invalidate halls list and specific hall detail
      queryClient.invalidateQueries({ queryKey: queryKeys.halls.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.halls.detail(variables.id) });
    },
  });
};

// Delete hall mutation
export const useDeleteHall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hallsApi.deleteHall(id),
    onSuccess: () => {
      // Invalidate halls list
      queryClient.invalidateQueries({ queryKey: queryKeys.halls.lists() });
    },
  });
};

// Toggle hall status mutation
export const useToggleHallStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hallsApi.toggleHallStatus(id),
    onSuccess: (_, id) => {
      // Invalidate halls list and specific hall detail
      queryClient.invalidateQueries({ queryKey: queryKeys.halls.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.halls.detail(id) });
    },
  });
};

// Optimistic update for hall status
export const useOptimisticHallStatusToggle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hallsApi.toggleHallStatus(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.halls.detail(id) });

      // Snapshot the previous value
      const previousHall = queryClient.getQueryData(queryKeys.halls.detail(id));

      // Optimistically update to the new value
      if (previousHall) {
        queryClient.setQueryData(queryKeys.halls.detail(id), {
          ...previousHall,
          is_active: !previousHall.is_active,
        });
      }

      return { previousHall };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousHall) {
        queryClient.setQueryData(queryKeys.halls.detail(id), context.previousHall);
      }
    },
    onSettled: (_, __, id) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.halls.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.halls.lists() });
    },
  });
};