import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  bookingsApi, 
  type CreateBookingRequest, 
  type BookingQueryParams 
} from '@/services/bookings';
import { queryKeys } from '@/lib/react-query';
import type { PricingRequest } from '@/types';

// Get bookings with pagination and filters
export const useBookings = (params?: BookingQueryParams) => {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: () => bookingsApi.getBookings(params),
  });
};

// Get single booking
export const useBooking = (id: number) => {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => bookingsApi.getBooking(id),
    enabled: !!id,
  });
};

// Get recent bookings
export const useRecentBookings = (limit: number = 10) => {
  return useQuery({
    queryKey: [...queryKeys.bookings.lists(), 'recent', limit],
    queryFn: () => bookingsApi.getRecentBookings(limit),
  });
};

// Get bookings by date range
export const useBookingsByDateRange = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: [...queryKeys.bookings.lists(), 'dateRange', startDate, endDate],
    queryFn: () => bookingsApi.getBookingsByDateRange(startDate!, endDate!),
    enabled: !!startDate && !!endDate,
  });
};

// Get customer bookings
export const useCustomerBookings = (customerEmail: string) => {
  return useQuery({
    queryKey: [...queryKeys.bookings.lists(), 'customer', customerEmail],
    queryFn: () => bookingsApi.getCustomerBookings(customerEmail),
    enabled: !!customerEmail,
  });
};

// Get booking statistics
export const useBookingStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: [...queryKeys.bookings.stats, startDate, endDate],
    queryFn: () => bookingsApi.getBookingStats(startDate, endDate),
  });
};

// Get booking menu items
export const useBookingMenuItems = (bookingId: number) => {
  return useQuery({
    queryKey: queryKeys.bookings.menuItems(bookingId),
    queryFn: () => bookingsApi.getBookingMenuItems(bookingId),
    enabled: !!bookingId,
  });
};

// Create booking mutation
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData: CreateBookingRequest) => bookingsApi.createBooking(bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.stats });
    },
  });
};

// Update booking mutation
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateBookingRequest> }) =>
      bookingsApi.updateBooking(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.stats });
    },
  });
};

// Delete booking mutation
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bookingsApi.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.stats });
    },
  });
};

// Update booking status mutation
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      bookingsApi.updateBookingStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.stats });
    },
  });
};

// Confirm booking mutation
export const useConfirmBooking = (params?: BookingQueryParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bookingsApi.confirmBooking(id),
    onSuccess: (data, id) => {
      // Optimistic update
      queryClient.setQueryData(["bookings", params], (oldData: any) => {
        if (oldData?.results) {
          return {
            ...oldData,
            results: oldData.results.map((b: any) => b.id === id ? { ...b, status: 'confirmed' } : b)
          };
        }
        return oldData;
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", id] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "stats"] });
    },
  });
};

// Cancel booking mutation
export const useCancelBooking = (params?: BookingQueryParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      bookingsApi.cancelBooking(id, reason),
    onSuccess: (data, variables) => {
      // Optimistic update
      queryClient.setQueryData(["bookings", params], (oldData: any) => {
        if (oldData?.results) {
          return {
            ...oldData,
            results: oldData.results.map((b: any) => b.id === variables.id ? { ...b, status: 'cancelled' } : b)
          };
        }
        return oldData;
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "stats"] });
    },
  });
};

// Complete booking mutation
export const useCompleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bookingsApi.completeBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.stats });
    },
  });
};

// Add menu item to booking mutation
export const useAddMenuItemToBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      bookingId, 
      menuItemData 
    }: { 
      bookingId: number; 
      menuItemData: { menu_item: number; variant?: number; quantity: number } 
    }) => bookingsApi.addMenuItemToBooking(bookingId, menuItemData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.bookings.menuItems(variables.bookingId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.bookings.detail(variables.bookingId) 
      });
    },
  });
};

// Update booking menu item mutation
export const useUpdateBookingMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity, bookingId }: { id: number; quantity: number; bookingId: number }) =>
      bookingsApi.updateBookingMenuItem(id, quantity),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.bookings.menuItems(variables.bookingId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.bookings.detail(variables.bookingId) 
      });
    },
  });
};

// Remove menu item from booking mutation
export const useRemoveMenuItemFromBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bookingId }: { id: number; bookingId: number }) =>
      bookingsApi.removeMenuItemFromBooking(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.bookings.menuItems(variables.bookingId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.bookings.detail(variables.bookingId) 
      });
    },
  });
};

// Get booking pricing mutation (for dynamic pricing calculation)
export const useBookingPricing = () => {
  return useMutation({
    mutationFn: (pricingData: PricingRequest) => bookingsApi.getBookingPricing(pricingData),
  });
};

// Bulk update status mutation
export const useBulkUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingIds, status }: { bookingIds: number[]; status: string }) =>
      bookingsApi.bulkUpdateStatus(bookingIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.stats });
    },
  });
};

// Export bookings mutation
export const useExportBookings = () => {
  return useMutation({
    mutationFn: (params?: BookingQueryParams) => bookingsApi.exportBookings(params),
  });
};

// Send confirmation email mutation
export const useSendConfirmationEmail = () => {
  return useMutation({
    mutationFn: (bookingId: number) => bookingsApi.sendConfirmationEmail(bookingId),
  });
};