import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  menuApi, 
  type CreateCategoryRequest, 
  type CreateMenuItemRequest, 
  type CreateVariantRequest,
  type CategoryQueryParams,
  type MenuItemQueryParams 
} from '@/services/menu';
import { queryKeys } from '@/lib/react-query';

// ===== CATEGORIES =====

// Get categories with pagination and filters
export const useCategories = (params?: CategoryQueryParams) => {
  return useQuery({
    queryKey: queryKeys.menu.categories.list(params),
    queryFn: () => menuApi.getCategories(params),
  });
};

// Get single category
export const useCategory = (id: number) => {
  return useQuery({
    queryKey: queryKeys.menu.categories.detail(id),
    queryFn: () => menuApi.getCategory(id),
    enabled: !!id,
  });
};

// Get active categories
export const useActiveCategories = () => {
  return useQuery({
    queryKey: queryKeys.menu.categories.list({ is_active: true }),
    queryFn: () => menuApi.getActiveCategories(),
  });
};

// Create category mutation
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData: CreateCategoryRequest) => menuApi.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.categories.lists() });
    },
  });
};

// Update category mutation
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateCategoryRequest> }) =>
      menuApi.updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.categories.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.categories.detail(variables.id) });
    },
  });
};

// Delete category mutation
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => menuApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.categories.lists() });
    },
  });
};

// Toggle category status mutation
export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => menuApi.toggleCategoryStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.categories.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.categories.detail(id) });
    },
  });
};

// ===== MENU ITEMS =====

// Get menu items with pagination and filters
export const useMenuItems = (params?: MenuItemQueryParams) => {
  return useQuery({
    queryKey: queryKeys.menu.items.list(params),
    queryFn: () => menuApi.getMenuItems(params),
  });
};

// Get single menu item
export const useMenuItem = (id: number) => {
  return useQuery({
    queryKey: queryKeys.menu.items.detail(id),
    queryFn: () => menuApi.getMenuItem(id),
    enabled: !!id,
  });
};

// Get items by category
export const useItemsByCategory = (categoryId: number) => {
  return useQuery({
    queryKey: queryKeys.menu.items.list({ category: categoryId }),
    queryFn: () => menuApi.getItemsByCategory(categoryId),
    enabled: !!categoryId,
  });
};

// Get available items
export const useAvailableMenuItems = () => {
  return useQuery({
    queryKey: queryKeys.menu.items.list({ is_available: true }),
    queryFn: () => menuApi.getAvailableItems(),
  });
};

// Create menu item mutation
export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemData: CreateMenuItemRequest) => menuApi.createMenuItem(itemData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.items.lists() });
      // Also invalidate the specific category's items
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.menu.items.list({ category: data.category }) 
      });
    },
  });
};

// Update menu item mutation
export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateMenuItemRequest> }) =>
      menuApi.updateMenuItem(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.items.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.items.detail(variables.id) });
      // Also invalidate the category's items
      if (data.category) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.menu.items.list({ category: data.category }) 
        });
      }
    },
  });
};

// Delete menu item mutation
export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => menuApi.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.items.lists() });
    },
  });
};

// Toggle menu item availability mutation
export const useToggleItemAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => menuApi.toggleItemAvailability(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.items.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.items.detail(id) });
    },
  });
};

// ===== MENU ITEM VARIANTS =====

// Get variants for menu item
export const useItemVariants = (menuItemId: number) => {
  return useQuery({
    queryKey: queryKeys.menu.items.variants(menuItemId),
    queryFn: () => menuApi.getItemVariants(menuItemId),
    enabled: !!menuItemId,
  });
};

// Create variant mutation
export const useCreateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantData: CreateVariantRequest) => menuApi.createVariant(variantData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.menu.items.variants(data.menu_item) 
      });
    },
  });
};

// Update variant mutation
export const useUpdateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateVariantRequest> }) =>
      menuApi.updateVariant(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.menu.items.variants(data.menu_item) 
      });
    },
  });
};

// Delete variant mutation
export const useDeleteVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, menuItemId }: { id: number; menuItemId: number }) => 
      menuApi.deleteVariant(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.menu.items.variants(variables.menuItemId) 
      });
    },
  });
};

// ===== BULK OPERATIONS =====

// Bulk update availability mutation
export const useBulkUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemIds, isAvailable }: { itemIds: number[]; isAvailable: boolean }) =>
      menuApi.bulkUpdateAvailability(itemIds, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.items.lists() });
    },
  });
};

// Bulk price update mutation
export const useBulkPriceUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: { id: number; base_price: string }[]) =>
      menuApi.bulkPriceUpdate(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.items.lists() });
    },
  });
};