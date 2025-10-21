import { api, ApiResponse } from '@/lib/api-client';
import type { Booking, BookingListItem, BookingMenuItem, PricingRequest, PricingResponse } from '@/types';

export interface CreateBookingRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  hall: number;
  event_date: string;
  event_time: string;
  event_end_time?: string;
  guest_count: number;
  event_type: 'wedding' | 'birthday' | 'corporate' | 'anniversary' | 'other';
  special_requests?: string;
  menu_items?: {
    menu_item: number;
    variant?: number;
    quantity: number;
  }[];
}

export interface UpdateBookingRequest extends Partial<CreateBookingRequest> {
  id: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface BookingQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  hall?: number;
  status?: string;
  event_type?: string;
  event_date?: string;
  event_date_after?: string;
  event_date_before?: string;
  customer_name?: string;
  ordering?: string;
}

export interface BookingStatsResponse {
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  completed_bookings: number;
  total_revenue: string;
  monthly_stats: {
    month: string;
    bookings: number;
    revenue: string;
  }[];
  event_type_stats: {
    event_type: string;
    count: number;
  }[];
}

export const bookingsApi = {
  // Get all bookings with pagination and filters
  getBookings: async (params?: BookingQueryParams): Promise<ApiResponse<BookingListItem>> => {
    const response = await api.get<ApiResponse<BookingListItem>>('/bookings/', { params });
    return response.data;
  },

  // Get single booking by ID
  getBooking: async (id: number): Promise<Booking> => {
    const response = await api.get<Booking>(`/bookings/${id}/`);
    return response.data;
  },

  // Create new booking
  createBooking: async (bookingData: CreateBookingRequest): Promise<Booking> => {
    const response = await api.post<Booking>('/bookings/', bookingData);
    return response.data;
  },

  // Update existing booking
  updateBooking: async (id: number, bookingData: Partial<CreateBookingRequest>): Promise<Booking> => {
    const response = await api.patch<Booking>(`/bookings/${id}/`, bookingData);
    return response.data;
  },

  // Delete booking
  deleteBooking: async (id: number): Promise<void> => {
    await api.delete(`/bookings/${id}/`);
  },

  // Update booking status
  updateBookingStatus: async (id: number, status: string): Promise<Booking> => {
    const response = await api.patch<Booking>(`/bookings/${id}/`, { status });
    return response.data;
  },

  // Confirm booking
  confirmBooking: async (id: number): Promise<Booking> => {
    const response = await api.post<Booking>(`/bookings/${id}/confirm/`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id: number, reason?: string): Promise<Booking> => {
    const response = await api.post<Booking>(`/bookings/${id}/cancel/`, { reason });
    return response.data;
  },

  // Complete booking
  completeBooking: async (id: number): Promise<Booking> => {
    const response = await api.post<Booking>(`/bookings/${id}/complete/`);
    return response.data;
  },

  // Get booking menu items
  getBookingMenuItems: async (bookingId: number): Promise<BookingMenuItem[]> => {
    const response = await api.get<ApiResponse<BookingMenuItem>>(`/bookings/${bookingId}/menu-items/`);
    return response.data.results || [];
  },

  // Add menu item to booking
  addMenuItemToBooking: async (
    bookingId: number,
    menuItemData: {
      menu_item: number;
      variant?: number;
      quantity: number;
    }
  ): Promise<BookingMenuItem> => {
    const response = await api.post<BookingMenuItem>(
      `/bookings/${bookingId}/menu-items/`,
      menuItemData
    );
    return response.data;
  },

  // Update booking menu item
  updateBookingMenuItem: async (
    id: number,
    quantity: number
  ): Promise<BookingMenuItem> => {
    const response = await api.patch<BookingMenuItem>(`/booking-menu-items/${id}/`, { quantity });
    return response.data;
  },

  // Remove menu item from booking
  removeMenuItemFromBooking: async (id: number): Promise<void> => {
    await api.delete(`/booking-menu-items/${id}/`);
  },

  // Get pricing for booking
  getBookingPricing: async (pricingData: PricingRequest): Promise<PricingResponse> => {
    const response = await api.post<PricingResponse>('/pricing/calculate/', pricingData);
    return response.data;
  },

  // Get booking statistics
  getBookingStats: async (
    startDate?: string,
    endDate?: string
  ): Promise<BookingStatsResponse> => {
    const response = await api.get<BookingStatsResponse>('/bookings/stats/', {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  },

  // Get recent bookings
  getRecentBookings: async (limit: number = 10): Promise<BookingListItem[]> => {
    const response = await api.get<ApiResponse<BookingListItem>>('/bookings/', {
      params: {
        page_size: limit,
        ordering: '-created_at',
      },
    });
    return response.data.results || [];
  },

  // Get bookings by date range
  getBookingsByDateRange: async (
    startDate: string,
    endDate: string
  ): Promise<BookingListItem[]> => {
    const response = await api.get<ApiResponse<BookingListItem>>('/bookings/', {
      params: {
        event_date_after: startDate,
        event_date_before: endDate,
        page_size: 100,
      },
    });
    return response.data.results || [];
  },

  // Get customer bookings
  getCustomerBookings: async (customerEmail: string): Promise<BookingListItem[]> => {
    const response = await api.get<ApiResponse<BookingListItem>>('/bookings/', {
      params: {
        search: customerEmail,
        page_size: 100,
      },
    });
    return response.data.results || [];
  },

  // Bulk operations
  bulkUpdateStatus: async (bookingIds: number[], status: string): Promise<void> => {
    await api.post('/bookings/bulk-update-status/', {
      booking_ids: bookingIds,
      status,
    });
  },

  // Export bookings
  exportBookings: async (params?: BookingQueryParams): Promise<Blob> => {
    const response = await api.get('/bookings/export/', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Send booking confirmation email
  sendConfirmationEmail: async (bookingId: number): Promise<void> => {
    await api.post(`/bookings/${bookingId}/send-confirmation/`);
  },
};

export default bookingsApi;