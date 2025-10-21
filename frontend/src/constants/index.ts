// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Core endpoints
  HALLS: '/api/core/halls',
  DISCOUNT_TIERS: '/api/core/discount-tiers',
  USERS: '/api/core/users',
  USER_PROFILES: '/api/core/user-profiles',
  
  // Menu endpoints
  MENU_CATEGORIES: '/api/menu/categories',
  MENU_ITEMS: '/api/menu/items',
  MENU_VARIANTS: '/api/menu/variants',
  
  // Booking endpoints
  BOOKINGS: '/api/bookings/bookings',
  
  // Pricing endpoints
  PRICING_CALCULATE: '/api/pricing/calculate',
  PRICING_SUGGEST: '/api/pricing/suggest',
  PRICING_RULES: '/api/pricing/rules',
  
  // Auth endpoints
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
} as const;

// Event Types
export const EVENT_TYPES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'birthday', label: 'Birthday Party' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'other', label: 'Other' },
] as const;

// Booking Status
export const BOOKING_STATUS = [
  { value: 'pending', label: 'Pending Confirmation', color: 'orange' },
  { value: 'confirmed', label: 'Confirmed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'completed', label: 'Completed', color: 'blue' },
] as const;

// Serving Types
export const SERVING_TYPES = [
  { value: 'per_plate', label: 'Per Plate' },
  { value: 'per_kg', label: 'Per KG' },
  { value: 'per_piece', label: 'Per Piece' },
  { value: 'per_portion', label: 'Per Portion' },
] as const;

// Contact Preferences
export const CONTACT_PREFERENCES = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'both', label: 'Both Phone & Email' },
] as const;

// App Configuration
export const APP_NAME = 'Marquee Booking System';
export const COMPANY_NAME = 'RoboSoft Innovations (SMC-Private) Limited';
export const COMPANY_EMAIL = 'robosoftinnovations@outlook.com';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Currency
export const CURRENCY_SYMBOL = 'PKR';
export const CURRENCY_LOCALE = 'en-PK';

// Date/Time Formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMM DD, YYYY';
export const DISPLAY_TIME_FORMAT = 'h:mm A';

// Validation
export const VALIDATION = {
  MIN_GUESTS: 1,
  MAX_GUESTS: 1000,
  MIN_PASSWORD_LENGTH: 8,
  PHONE_REGEX: /^[\+]?[0-9\-\(\)\s]+$/,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  CART_ITEMS: 'cart_items',
  BOOKING_DRAFT: 'booking_draft',
} as const;

// Theme Colors (matching Shadcn/UI)
export const COLORS = {
  PRIMARY: 'hsl(var(--primary))',
  SECONDARY: 'hsl(var(--secondary))',
  MUTED: 'hsl(var(--muted))',
  ACCENT: 'hsl(var(--accent))',
  DESTRUCTIVE: 'hsl(var(--destructive))',
  WARNING: 'hsl(var(--warning))',
  SUCCESS: 'hsl(var(--success))',
} as const;

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  HALLS: '/halls',
  MENU: '/menu',
  BOOKING: '/booking',
  MY_BOOKINGS: '/bookings',
  PROFILE: '/profile',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_HALLS: '/admin/halls',
  ADMIN_MENU: '/admin/menu',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_USERS: '/admin/users',
} as const;

// Query Keys for React Query
export const QUERY_KEYS = {
  HALLS: ['halls'],
  HALL: (id: number) => ['halls', id],
  MENU_CATEGORIES: ['menu-categories'],
  MENU_ITEMS: ['menu-items'],
  MENU_ITEM: (id: number) => ['menu-items', id],
  BOOKINGS: ['bookings'],
  BOOKING: (id: string) => ['bookings', id],
  MY_BOOKINGS: ['my-bookings'],
  DISCOUNT_TIERS: ['discount-tiers'],
  USER_PROFILE: ['user-profile'],
  PRICING_CALCULATION: ['pricing-calculation'],
  BUDGET_SUGGESTION: ['budget-suggestion'],
} as const;