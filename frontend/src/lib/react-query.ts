import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Query keys for consistent cache management
export const queryKeys = {
  auth: {
    user: ["auth", "user"] as const,
    profile: ["auth", "profile"] as const,
  },
  users: {
    all: ["users"] as const,
    detail: (id: number) => ["users", id] as const,
  },
  organizations: {
    all: ["organizations"] as const,
    detail: (id: number) => ["organizations", id] as const,
    stats: (id: number) => ["organizations", id, "stats"] as const,
    members: (id: number) => ["organizations", id, "members"] as const,
  },
  marketplace: {
    venues: ["marketplace", "venues"] as const,
    venue: (id: number) => ["marketplace", "venues", id] as const,
  },
  halls: {
    all: (orgId?: number) =>
      orgId ? ["organizations", orgId, "halls"] : (["halls"] as const),
    detail: (id: number) => ["halls", id] as const,
  },
  menu: {
    categories: (orgId?: number) =>
      orgId
        ? ["organizations", orgId, "menu-categories"]
        : (["menu-categories"] as const),
    items: (orgId?: number) =>
      orgId
        ? ["organizations", orgId, "menu-items"]
        : (["menu-items"] as const),
    packages: (orgId?: number) =>
      orgId
        ? ["organizations", orgId, "menu-packages"]
        : (["menu-packages"] as const),
  },
  bookings: {
    all: (orgId?: number) =>
      orgId ? ["organizations", orgId, "bookings"] : (["bookings"] as const),
    lists: () => ["bookings", "lists"] as const,
    detail: (id: string) => ["bookings", id] as const,
    myBookings: ["my-bookings"] as const,
    stats: ["bookings", "stats"] as const,
    menuItems: (bookingId: number) => ["bookings", bookingId, "menu-items"] as const,
  },
  pricing: {
    calculation: ["pricing-calculation"] as const,
    suggestion: ["budget-suggestion"] as const,
    discountTiers: (orgId?: number) =>
      orgId
        ? ["organizations", orgId, "discount-tiers"]
        : (["discount-tiers"] as const),
  },
} as const;
