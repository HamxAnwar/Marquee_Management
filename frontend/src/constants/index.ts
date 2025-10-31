// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  // Core endpoints
  HALLS: "/api/core/halls",
  DISCOUNT_TIERS: "/api/core/discount-tiers",
  USERS: "/api/core/users",
  USER_PROFILES: "/api/core/user-profiles",

  // Organization endpoints
  ORGANIZATIONS: "/api/organizations",
  MARKETPLACE: "/api/marketplace",
  ORGANIZATION_REGISTER: "/api/organizations",
  ORGANIZATION_APPROVE: "/api/organizations/{id}/approve",
  ORGANIZATION_SUSPEND: "/api/organizations/{id}/suspend",
  ORGANIZATION_MEMBERS: "/api/organizations/{id}/members",
  ORGANIZATION_STATS: "/api/organizations/{id}/stats",

  // Platform admin endpoints
  PLATFORM_ADMIN: "/api/admin",
  PLATFORM_SETTINGS: "/api/admin/settings",
  PLATFORM_PENDING: "/api/admin/pending-approvals",
  PLATFORM_BULK_APPROVE: "/api/admin/bulk-approve",
  PLATFORM_BULK_SUSPEND: "/api/admin/bulk-suspend",

  // Menu endpoints
  MENU_CATEGORIES: "/api/menu/categories",
  MENU_ITEMS: "/api/menu/items",
  MENU_VARIANTS: "/api/menu/variants",
  MENU_PACKAGES: "/api/menu/packages",

  // Booking endpoints
  BOOKINGS: "/api/bookings/bookings",

  // Pricing endpoints
  PRICING_CALCULATE: "/api/pricing/calculate",
  PRICING_SUGGEST: "/api/pricing/suggest",
  PRICING_RULES: "/api/pricing/rules",

  // Auth endpoints
  AUTH_LOGIN: "/api/auth/login",
  AUTH_REGISTER: "/api/auth/register",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_REFRESH: "/api/auth/token/refresh",
} as const;

// Event Types
export const EVENT_TYPES = [
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday Party" },
  { value: "corporate", label: "Corporate Event" },
  { value: "anniversary", label: "Anniversary" },
  { value: "other", label: "Other" },
] as const;

// Booking Status
export const BOOKING_STATUS = [
  { value: "pending", label: "Pending Confirmation", color: "orange" },
  { value: "confirmed", label: "Confirmed", color: "green" },
  { value: "cancelled", label: "Cancelled", color: "red" },
  { value: "completed", label: "Completed", color: "blue" },
] as const;

// Serving Types
export const SERVING_TYPES = [
  { value: "per_plate", label: "Per Plate" },
  { value: "per_kg", label: "Per KG" },
  { value: "per_piece", label: "Per Piece" },
  { value: "per_portion", label: "Per Portion" },
] as const;

// Contact Preferences
export const CONTACT_PREFERENCES = [
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "both", label: "Both Phone & Email" },
] as const;

// App Configuration
export const APP_NAME = "MarqueeBooking";
export const COMPANY_NAME = "RoboSoft Innovations (SMC-Private) Limited";
export const COMPANY_EMAIL = "robosoftinnovations@outlook.com";
export const PLATFORM_TAGLINE = "Pakistan's Premier Event Venue Platform";

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Currency
export const CURRENCY_SYMBOL = "PKR";
export const CURRENCY_LOCALE = "en-PK";

// Date/Time Formats
export const DATE_FORMAT = "YYYY-MM-DD";
export const TIME_FORMAT = "HH:mm";
export const DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const DISPLAY_DATE_FORMAT = "MMM DD, YYYY";
export const DISPLAY_TIME_FORMAT = "h:mm A";

// Validation
export const VALIDATION = {
  MIN_GUESTS: 1,
  MAX_GUESTS: 1000,
  MIN_PASSWORD_LENGTH: 8,
  PHONE_REGEX: /^[\+]?[0-9\-\(\)\s]+$/,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  CART_ITEMS: "cart_items",
  BOOKING_DRAFT: "booking_draft",
  SEARCH_FILTERS: "search_filters",
  RECENT_SEARCHES: "recent_searches",
  FAVORITE_VENUES: "favorite_venues",
} as const;

// Theme Colors (matching Shadcn/UI)
export const COLORS = {
  PRIMARY: "hsl(var(--primary))",
  SECONDARY: "hsl(var(--secondary))",
  MUTED: "hsl(var(--muted))",
  ACCENT: "hsl(var(--accent))",
  DESTRUCTIVE: "hsl(var(--destructive))",
  WARNING: "hsl(var(--warning))",
  SUCCESS: "hsl(var(--success))",
} as const;

// Navigation Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",

  // Marketplace (Customer facing)
  MARKETPLACE: "/marketplace",
  VENUE_DETAILS: "/marketplace/{id}",
  SEARCH: "/search",

  // Customer account
  MY_BOOKINGS: "/bookings",
  PROFILE: "/profile",

  // Venue owner routes
  BECOME_PARTNER: "/become-partner",
  PARTNER_DASHBOARD: "/partner",

  // Venue admin routes (for venue owners)
  ADMIN: "/admin",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin",
  ADMIN_HALLS: "/admin/halls",
  ADMIN_MENU: "/admin/menu",
  ADMIN_BOOKINGS: "/admin/bookings",
  ADMIN_USERS: "/admin/users",
  ADMIN_ORGANIZATION: "/admin/organization",

  // Platform admin routes (for platform administrators)
  PLATFORM_ADMIN: "/platform-admin",
  PLATFORM_ORGANIZATIONS: "/platform-admin/organizations",
  PLATFORM_ANALYTICS: "/platform-admin/analytics",
  PLATFORM_SETTINGS: "/platform-admin/settings",

  // Static pages
  HOW_IT_WORKS: "/how-it-works",
  PARTNER_BENEFITS: "/partner-benefits",
  ABOUT: "/about",
  CONTACT: "/contact",
  PRIVACY: "/privacy",
  TERMS: "/terms",
} as const;

// Query Keys for React Query
export const QUERY_KEYS = {
  // Organizations and marketplace
  ORGANIZATIONS: ["organizations"],
  ORGANIZATION: (id: number) => ["organizations", id],
  ORGANIZATION_STATS: (id: number) => ["organizations", id, "stats"],
  ORGANIZATION_MEMBERS: (id: number) => ["organizations", id, "members"],
  MARKETPLACE: ["marketplace"],
  MARKETPLACE_ORGANIZATION: (id: number) => ["marketplace", id],

  // Platform admin
  PLATFORM_STATS: ["platform-stats"],
  PLATFORM_PENDING: ["platform-pending-approvals"],
  PLATFORM_SETTINGS: ["platform-settings"],

  // Halls (now organization-specific)
  HALLS: (orgId?: number) =>
    orgId ? ["organizations", orgId, "halls"] : ["halls"],
  HALL: (id: number) => ["halls", id],

  // Menu (now organization-specific)
  MENU_CATEGORIES: (orgId?: number) =>
    orgId ? ["organizations", orgId, "menu-categories"] : ["menu-categories"],
  MENU_ITEMS: (orgId?: number) =>
    orgId ? ["organizations", orgId, "menu-items"] : ["menu-items"],
  MENU_PACKAGES: (orgId?: number) =>
    orgId ? ["organizations", orgId, "menu-packages"] : ["menu-packages"],
  MENU_ITEM: (id: number) => ["menu-items", id],

  // Bookings
  BOOKINGS: (orgId?: number) =>
    orgId ? ["organizations", orgId, "bookings"] : ["bookings"],
  BOOKING: (id: string) => ["bookings", id],
  MY_BOOKINGS: ["my-bookings"],

  // Pricing and discounts
  DISCOUNT_TIERS: (orgId?: number) =>
    orgId ? ["organizations", orgId, "discount-tiers"] : ["discount-tiers"],
  PRICING_CALCULATION: ["pricing-calculation"],
  BUDGET_SUGGESTION: ["budget-suggestion"],

  // User data
  USER_PROFILE: ["user-profile"],
  CURRENT_USER: ["current-user"],
} as const;
