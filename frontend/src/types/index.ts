// API Response Types
export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  preferred_contact?: 'phone' | 'email' | 'both';
  role: 'admin' | 'staff' | 'customer';
  is_staff: boolean;
  is_active: boolean;
}

// Hall Types
export interface Hall {
  id: number;
  name: string;
  description: string;
  capacity: number;
  base_price: string;
  is_active: boolean;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface HallListItem {
  id: number;
  name: string;
  capacity: number;
  base_price: string;
  is_active: boolean;
}

// Menu Types
export interface MenuCategory {
  id: number;
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
  items_count: number;
  created_at: string;
}

export interface MenuItemVariant {
  id: number;
  name: string;
  price_modifier: string;
  final_price: string;
  is_available: boolean;
}

export interface MenuItem {
  id: number;
  name: string;
  category: number;
  category_name: string;
  description: string;
  base_price: string;
  serving_type: 'per_plate' | 'per_kg' | 'per_piece' | 'per_portion';
  serving_type_display: string;
  is_vegetarian: boolean;
  is_available: boolean;
  image?: string;
  ingredients: string;
  preparation_time: number;
  display_order: number;
  variants: MenuItemVariant[];
  created_at: string;
  updated_at: string;
}

export interface MenuItemListItem {
  id: number;
  name: string;
  category_name: string;
  base_price: string;
  serving_type_display: string;
  is_vegetarian: boolean;
  is_available: boolean;
  has_variants: boolean;
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type EventType = 'wedding' | 'birthday' | 'corporate' | 'anniversary' | 'other';

export interface BookingMenuItem {
  id: number;
  menu_item: MenuItemListItem;
  variant?: MenuItemVariant;
  quantity: number;
  unit_price: string;
  total_price: string;
  notes: string;
}

export interface BookingStatusHistory {
  id: number;
  old_status: string;
  new_status: string;
  changed_by: User;
  reason: string;
  timestamp: string;
}

export interface Booking {
  booking_id: string;
  customer: User;
  hall: HallListItem;
  event_date: string;
  event_time: string;
  event_type: EventType;
  event_type_display: string;
  guest_count: number;
  contact_phone: string;
  contact_email: string;
  special_requirements: string;
  subtotal: string;
  discount_amount: string;
  tax_amount: string;
  total_amount: string;
  status: BookingStatus;
  status_display: string;
  menu_items: BookingMenuItem[];
  is_upcoming: boolean;
  is_past: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
}

export interface BookingListItem {
  booking_id: string;
  customer_name: string;
  hall_name: string;
  event_date: string;
  event_type_display: string;
  guest_count: number;
  total_amount: string;
  status: BookingStatus;
  status_display: string;
  is_upcoming: boolean;
  is_past: boolean;
  created_at: string;
}

// Discount Types
export interface DiscountTier {
  id: number;
  name: string;
  min_guests: number;
  max_guests: number;
  discount_percentage: string;
  is_active: boolean;
  created_at: string;
}

// Pricing Types
export interface PriceCalculationRequest {
  hall_id: number;
  guest_count: number;
  menu_items: {
    menu_item_id: number;
    variant_id?: number;
    quantity: number;
  }[];
  event_date?: string;
}

export interface PriceCalculationResponse {
  hall_base_price: string;
  menu_subtotal: string;
  guest_discount_tier?: DiscountTier;
  guest_discount_amount: string;
  service_charge_rate: string;
  service_charge_amount: string;
  tax_rate: string;
  tax_amount: string;
  subtotal_before_discount: string;
  total_discount: string;
  subtotal_after_discount: string;
  grand_total: string;
  price_per_person: string;
  breakdown: {
    hall: string;
    menu: string;
    discount: string;
    service_charge: string;
    tax: string;
    total: string;
  };
}

export interface BudgetSuggestionRequest {
  target_budget: number;
  guest_count: number;
  hall_id?: number;
  preferences?: {
    vegetarian_only?: boolean;
    exclude_categories?: number[];
  };
}

export interface SuggestedMenuItem {
  menu_item: MenuItemListItem;
  suggested_quantity: number;
  estimated_cost: string;
}

export interface BudgetSuggestionResponse {
  suggestion_id: number;
  target_budget: string;
  guest_count: number;
  hall?: HallListItem;
  suggested_per_person_budget: string;
  total_estimated_cost: string;
  variance_percentage: string;
  suggested_menu_items: SuggestedMenuItem[];
  breakdown: {
    hall_cost: string;
    menu_cost: string;
    total: string;
  };
  notes: string;
}

// Form Types
export interface BookingFormData {
  hall_id: number;
  event_date: string;
  event_time: string;
  event_type: EventType;
  guest_count: number;
  contact_phone: string;
  contact_email: string;
  special_requirements?: string;
  menu_items: {
    menu_item_id: number;
    variant_id?: number;
    quantity: number;
    unit_price: number;
  }[];
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
  phone?: string;
  address?: string;
}

// Cart Types (for booking process)
export interface CartItem {
  menu_item: MenuItem;
  variant?: MenuItemVariant;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total_items: number;
  subtotal: number;
}