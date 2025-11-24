import { api, ApiResponse } from '@/lib/api-client';
import type { MenuCategory, MenuItem, MenuItemVariant } from '@/types';

// Menu Categories
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface CategoryQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  ordering?: string;
}

// Menu Items
export interface CreateMenuItemRequest {
  name: string;
  description?: string;
  category: number;
  base_price: string;
  is_vegetarian?: boolean;
  is_available?: boolean;
  ingredients?: string[];
  allergens?: string[];
  preparation_time?: number;
}

export interface MenuItemQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: number;
  organization?: number;
  is_vegetarian?: boolean;
  is_available?: boolean;
  min_price?: number;
  max_price?: number;
  ordering?: string;
}

// Menu Item Variants
export interface CreateVariantRequest {
  menu_item: number;
  name: string;
  price_modifier: string;
  description?: string;
  is_available?: boolean;
}

export const menuApi = {
  // === CATEGORIES ===
  
  // Get all categories
  getCategories: async (params?: CategoryQueryParams): Promise<ApiResponse<MenuCategory>> => {
    const response = await api.get<ApiResponse<MenuCategory>>('/menu/categories/', { params });
    return response.data;
  },

  // Get single category
  getCategory: async (id: number): Promise<MenuCategory> => {
    const response = await api.get<MenuCategory>(`/menu/categories/${id}/`);
    return response.data;
  },

  // Create new category
  createCategory: async (categoryData: CreateCategoryRequest): Promise<MenuCategory> => {
    const response = await api.post<MenuCategory>('/menu/categories/', categoryData);
    return response.data;
  },

  // Update category
  updateCategory: async (id: number, categoryData: Partial<CreateCategoryRequest>): Promise<MenuCategory> => {
    const response = await api.patch<MenuCategory>(`/menu/categories/${id}/`, categoryData);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/menu/categories/${id}/`);
  },

  // Toggle category status
  toggleCategoryStatus: async (id: number): Promise<MenuCategory> => {
    const response = await api.post<MenuCategory>(`/menu/categories/${id}/toggle-status/`);
    return response.data;
  },

  // Get active categories (simplified)
  getActiveCategories: async (): Promise<MenuCategory[]> => {
    const response = await api.get<ApiResponse<MenuCategory>>('/menu/categories/', {
      params: { is_active: true, page_size: 100 },
    });
    return response.data.results || [];
  },

  // === MENU ITEMS ===

  // Get all menu items
  getMenuItems: async (params?: MenuItemQueryParams): Promise<ApiResponse<MenuItem>> => {
    const response = await api.get<ApiResponse<MenuItem>>('/menu/items/', { params });
    return response.data;
  },

  // Get single menu item
  getMenuItem: async (id: number): Promise<MenuItem> => {
    const response = await api.get<MenuItem>(`/menu/items/${id}/`);
    return response.data;
  },

  // Create new menu item
  createMenuItem: async (itemData: CreateMenuItemRequest): Promise<MenuItem> => {
    const response = await api.post<MenuItem>('/menu/items/', itemData);
    return response.data;
  },

  // Update menu item
  updateMenuItem: async (id: number, itemData: Partial<CreateMenuItemRequest>): Promise<MenuItem> => {
    const response = await api.patch<MenuItem>(`/menu/items/${id}/`, itemData);
    return response.data;
  },

  // Delete menu item
  deleteMenuItem: async (id: number): Promise<void> => {
    await api.delete(`/menu/items/${id}/`);
  },

  // Toggle menu item availability
  toggleItemAvailability: async (id: number): Promise<MenuItem> => {
    const response = await api.post<MenuItem>(`/menu/items/${id}/toggle-availability/`);
    return response.data;
  },

  // Get items by category
  getItemsByCategory: async (categoryId: number): Promise<MenuItem[]> => {
    const response = await api.get<ApiResponse<MenuItem>>('/menu/items/', {
      params: { category: categoryId, page_size: 100 },
    });
    return response.data.results || [];
  },

  // Get available items
  getAvailableItems: async (): Promise<MenuItem[]> => {
    const response = await api.get<ApiResponse<MenuItem>>('/menu/items/', {
      params: { is_available: true, page_size: 100 },
    });
    return response.data.results || [];
  },

  // === MENU ITEM VARIANTS ===

  // Get variants for menu item
  getItemVariants: async (menuItemId: number): Promise<MenuItemVariant[]> => {
    const response = await api.get<ApiResponse<MenuItemVariant>>(`/menu/items/${menuItemId}/variants/`);
    return response.data.results || [];
  },

  // Create variant
  createVariant: async (variantData: CreateVariantRequest): Promise<MenuItemVariant> => {
    const response = await api.post<MenuItemVariant>('/menu/variants/', variantData);
    return response.data;
  },

  // Update variant
  updateVariant: async (id: number, variantData: Partial<CreateVariantRequest>): Promise<MenuItemVariant> => {
    const response = await api.patch<MenuItemVariant>(`/menu/variants/${id}/`, variantData);
    return response.data;
  },

  // Delete variant
  deleteVariant: async (id: number): Promise<void> => {
    await api.delete(`/menu/variants/${id}/`);
  },

  // === BULK OPERATIONS ===

  // Bulk update item availability
  bulkUpdateAvailability: async (itemIds: number[], isAvailable: boolean): Promise<void> => {
    await api.post('/menu/items/bulk-update-availability/', {
      item_ids: itemIds,
      is_available: isAvailable,
    });
  },

  // Bulk price update
  bulkPriceUpdate: async (updates: { id: number; base_price: string }[]): Promise<void> => {
    await api.post('/menu/items/bulk-price-update/', { updates });
  },
};

export default menuApi;