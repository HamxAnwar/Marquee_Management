import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '@/constants';
import {
  ApiResponse,
  Hall,
  HallListItem,
  MenuCategory,
  MenuItem,
  MenuItemListItem,
  Booking,
  BookingListItem,
  BookingFormData,
  DiscountTier,
  PriceCalculationRequest,
  PriceCalculationResponse,
  BudgetSuggestionRequest,
  BudgetSuggestionResponse,
  User,
  UserProfile,
  LoginFormData,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Token ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuthToken();
          // Redirect to login if running in browser
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    return null;
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    }
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }

  // Generic methods
  private async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  private async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  private async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  private async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  private async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  // Authentication
  async login(credentials: LoginFormData): Promise<{ token: string; user: User }> {
    const response = await this.post<{ token: string; user: User }>(
      API_ENDPOINTS.AUTH_LOGIN,
      credentials
    );
    this.setAuthToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.post(API_ENDPOINTS.AUTH_LOGOUT);
    } finally {
      this.clearAuthToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.get<User>(`${API_ENDPOINTS.USERS}/me/`);
  }

  // Halls API
  async getHalls(params?: { is_active?: boolean; search?: string }): Promise<ApiResponse<HallListItem>> {
    return this.get<ApiResponse<HallListItem>>(API_ENDPOINTS.HALLS, { params });
  }

  async getHall(id: number): Promise<Hall> {
    return this.get<Hall>(`${API_ENDPOINTS.HALLS}/${id}/`);
  }

  async getAvailableHalls(): Promise<HallListItem[]> {
    const response = await this.get<HallListItem[]>(`${API_ENDPOINTS.HALLS}/available/`);
    return response;
  }

  async checkHallCapacity(id: number, guestCount: number): Promise<{
    hall: string;
    capacity: number;
    requested_guests: number;
    can_accommodate: boolean;
    available_space: number;
  }> {
    return this.get(`${API_ENDPOINTS.HALLS}/${id}/capacity_check/`, {
      params: { guest_count: guestCount }
    });
  }

  // Menu API
  async getMenuCategories(params?: { is_active?: boolean }): Promise<ApiResponse<MenuCategory>> {
    return this.get<ApiResponse<MenuCategory>>(API_ENDPOINTS.MENU_CATEGORIES, { params });
  }

  async getMenuCategoriesWithItems(): Promise<{
    category: MenuCategory;
    items: MenuItemListItem[];
  }[]> {
    return this.get(`${API_ENDPOINTS.MENU_CATEGORIES}/with_items/`);
  }

  async getMenuItems(params?: {
    category?: number;
    is_available?: boolean;
    is_vegetarian?: boolean;
    search?: string;
  }): Promise<ApiResponse<MenuItemListItem>> {
    return this.get<ApiResponse<MenuItemListItem>>(API_ENDPOINTS.MENU_ITEMS, { params });
  }

  async getMenuItem(id: number): Promise<MenuItem> {
    return this.get<MenuItem>(`${API_ENDPOINTS.MENU_ITEMS}/${id}/`);
  }

  async getAvailableMenuItems(): Promise<MenuItemListItem[]> {
    return this.get(`${API_ENDPOINTS.MENU_ITEMS}/available/`);
  }

  async getVegetarianMenuItems(): Promise<MenuItemListItem[]> {
    return this.get(`${API_ENDPOINTS.MENU_ITEMS}/vegetarian/`);
  }

  async getMenuItemsByCategory(): Promise<{
    category: MenuCategory;
    items: MenuItemListItem[];
  }[]> {
    return this.get(`${API_ENDPOINTS.MENU_ITEMS}/by_category/`);
  }

  // Bookings API
  async getBookings(params?: {
    status?: string;
    hall?: number;
    time_filter?: 'upcoming' | 'past';
    search?: string;
  }): Promise<ApiResponse<BookingListItem>> {
    return this.get<ApiResponse<BookingListItem>>(API_ENDPOINTS.BOOKINGS, { params });
  }

  async getBooking(id: string): Promise<Booking> {
    return this.get<Booking>(`${API_ENDPOINTS.BOOKINGS}/${id}/`);
  }

  async getMyBookings(): Promise<BookingListItem[]> {
    return this.get(`${API_ENDPOINTS.BOOKINGS}/my_bookings/`);
  }

  async getUpcomingBookings(): Promise<BookingListItem[]> {
    return this.get(`${API_ENDPOINTS.BOOKINGS}/upcoming/`);
  }

  async createBooking(data: BookingFormData): Promise<Booking> {
    return this.post<Booking>(API_ENDPOINTS.BOOKINGS, data);
  }

  async updateBooking(id: string, data: Partial<BookingFormData>): Promise<Booking> {
    return this.patch<Booking>(`${API_ENDPOINTS.BOOKINGS}/${id}/`, data);
  }

  async confirmBooking(id: string): Promise<Booking> {
    return this.post<Booking>(`${API_ENDPOINTS.BOOKINGS}/${id}/confirm/`);
  }

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    return this.post<Booking>(`${API_ENDPOINTS.BOOKINGS}/${id}/cancel/`, { reason });
  }

  // Discount Tiers API
  async getDiscountTiers(): Promise<ApiResponse<DiscountTier>> {
    return this.get<ApiResponse<DiscountTier>>(API_ENDPOINTS.DISCOUNT_TIERS);
  }

  async getDiscountTierForGuestCount(guestCount: number): Promise<{
    guest_count: number;
    applicable_tier: DiscountTier | null;
  }> {
    return this.get(`${API_ENDPOINTS.DISCOUNT_TIERS}/for_guest_count/`, {
      params: { guest_count: guestCount }
    });
  }

  // Pricing API
  async calculatePrice(request: PriceCalculationRequest): Promise<PriceCalculationResponse> {
    return this.post<PriceCalculationResponse>(API_ENDPOINTS.PRICING_CALCULATE, request);
  }

  async suggestMenuByBudget(request: BudgetSuggestionRequest): Promise<BudgetSuggestionResponse> {
    return this.post<BudgetSuggestionResponse>(API_ENDPOINTS.PRICING_SUGGEST, request);
  }

  // User Profile API
  async getUserProfile(): Promise<UserProfile> {
    return this.get(`${API_ENDPOINTS.USER_PROFILES}/me/`);
  }

  async updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.patch(`${API_ENDPOINTS.USER_PROFILES}/me/`, data);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;