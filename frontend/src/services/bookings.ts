import { api, ApiResponse } from '@/lib/api-client';
import type { Booking, BookingListItem, BookingMenuItem, PricingRequest, PricingResponse } from '@/types';
import { API_ENDPOINTS } from '@/constants';

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
  organization?: number;
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
    const response = await api.get<ApiResponse<BookingListItem>>(API_ENDPOINTS.BOOKINGS, { params });
    return response.data;
  },

  // Get single booking by ID
  getBooking: async (id: number): Promise<Booking> => {
    const response = await api.get<Booking>(`${API_ENDPOINTS.BOOKINGS}/${id}`);
    return response.data;
  },

  // Create new booking
  createBooking: async (bookingData: CreateBookingRequest): Promise<Booking> => {
    const response = await api.post<Booking>(API_ENDPOINTS.BOOKINGS, bookingData);
    return response.data;
  },

  // Update existing booking
  updateBooking: async (id: number, bookingData: Partial<CreateBookingRequest>): Promise<Booking> => {
    const response = await api.patch<Booking>(`${API_ENDPOINTS.BOOKINGS}/${id}`, bookingData);
    return response.data;
  },

  // Delete booking
  deleteBooking: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.BOOKINGS}/${id}`);
  },

  // Update booking status
  updateBookingStatus: async (id: number, status: string): Promise<Booking> => {
    const response = await api.patch<Booking>(`${API_ENDPOINTS.BOOKINGS}/${id}`, { status });
    return response.data;
  },

  // Confirm booking
  confirmBooking: async (id: number): Promise<Booking> => {
    const response = await api.post<Booking>(`${API_ENDPOINTS.BOOKINGS}/${id}/confirm`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id: number, reason?: string): Promise<Booking> => {
    const response = await api.post<Booking>(`${API_ENDPOINTS.BOOKINGS}/${id}/cancel`, { reason });
    return response.data;
  },

  // Complete booking
  completeBooking: async (id: number): Promise<Booking> => {
    const response = await api.post<Booking>(`${API_ENDPOINTS.BOOKINGS}/${id}/complete`);
    return response.data;
  },

  // Get booking menu items
  getBookingMenuItems: async (bookingId: number): Promise<ApiResponse<BookingMenuItem>> => {
    const response = await api.get<ApiResponse<BookingMenuItem>>(`${API_ENDPOINTS.BOOKINGS}/${bookingId}/menu-items`);
    return response.data;
  },

  // Add menu item to booking
  addMenuItemToBooking: async (
    bookingId: number,
    menuItemData: { menu_item: number; variant?: number; quantity: number }
  ): Promise<BookingMenuItem> => {
    const response = await api.post<BookingMenuItem>(
      `${API_ENDPOINTS.BOOKINGS}/${bookingId}/menu-items/`,
      menuItemData
    );
    return response.data;
  },

  // Update booking menu item
  updateBookingMenuItem: async (id: number, quantity: number): Promise<BookingMenuItem> => {
    const response = await api.patch<BookingMenuItem>(`${API_ENDPOINTS.BOOKINGS}${id}/`, { quantity });
    return response.data;
  },

  // Remove menu item from booking
  removeMenuItemFromBooking: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.BOOKINGS}${id}/`);
  },

  // Add menu item to booking
  addMenuItemToBooking: async (
    bookingId: number,
    menuItemData: { menu_item: number; variant?: number; quantity: number }
  ): Promise<BookingMenuItem> => {
    const response = await api.post<BookingMenuItem>(
      `${API_ENDPOINTS.BOOKINGS}/${bookingId}/menu-items`,
      menuItemData
    );
    return response.data;
  },

  // Update booking menu item
  updateBookingMenuItem: async (id: number, quantity: number): Promise<BookingMenuItem> => {
    const response = await api.patch<BookingMenuItem>(`${API_ENDPOINTS.BOOKINGS}/${id}`, { quantity });
    return response.data;
  },

  // Remove menu item from booking
  removeMenuItemFromBooking: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.BOOKINGS}/${id}`);
  },

  // Remove menu item from booking
  removeMenuItemFromBooking: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.BOOKINGS}/${id}/`);
  },

  // Get booking statistics
  getBookingStats: async (
    startDate?: string,
    endDate?: string
  ): Promise<BookingStatsResponse> => {
    const response = await api.get<BookingStatsResponse>(`${API_ENDPOINTS.BOOKINGS}/stats`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  // Get recent bookings
  getRecentBookings: async (limit: number = 10): Promise<ApiResponse<BookingListItem>> => {
    const response = await api.get<ApiResponse<BookingListItem>>(API_ENDPOINTS.BOOKINGS, {
      params: { limit, ordering: '-created_at' },
    });
    return response.data;
  },

  // Get bookings by date range
  getBookingsByDateRange: async (
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<BookingListItem>> => {
    const response = await api.get<ApiResponse<BookingListItem>>(API_ENDPOINTS.BOOKINGS, {
      params: { event_date__gte: startDate, event_date__lte: endDate },
    });
    return response.data;
  },

  // Get customer bookings
  getCustomerBookings: async (customerEmail: string): Promise<ApiResponse<BookingListItem>> => {
    const response = await api.get<ApiResponse<BookingListItem>>(API_ENDPOINTS.BOOKINGS, {
      params: { customer_email: customerEmail },
    });
    return response.data;
  },

  // Bulk update status
  bulkUpdateStatus: async (bookingIds: number[], status: string): Promise<void> => {
    await api.post(`${API_ENDPOINTS.BOOKINGS}/bulk-update-status`, {
      booking_ids: bookingIds,
      status,
    });
  },

  // Export bookings
  exportBookings: async (params?: BookingQueryParams): Promise<Blob> => {
    const response = await api.get(`${API_ENDPOINTS.BOOKINGS}/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Send confirmation email
  sendConfirmationEmail: async (bookingId: number): Promise<void> => {
    await api.post(`${API_ENDPOINTS.BOOKINGS}/${bookingId}/send-confirmation`);
  },

  // Get pricing for booking
  getBookingPricing: async (pricingData: PricingRequest): Promise<PricingResponse> => {
    const response = await api.post<PricingResponse>('/api/v1/pricing/calculate/', pricingData);
    return response.data;
  },
};

export default bookingsApi;