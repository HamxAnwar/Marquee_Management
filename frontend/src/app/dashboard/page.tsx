"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");

    if (!userData) {
      // No user data, redirect to login
      router.replace("/auth/login");
      return;
    }

    try {
      const user = JSON.parse(userData);
      const userRole = user.role;

      // Role-based routing
      switch (userRole) {
        case "platform_admin":
          // Platform administrators go to Django admin
          window.location.href = "http://localhost:8000/admin";
          break;

        case "venue_owner":
          // Venue owners go to their management dashboard
          router.replace("/admin");
          break;

        case "customer":
          // Customers go to marketplace
          router.replace("/marketplace");
          break;

        default:
          // Unknown role, redirect to marketplace as fallback
          console.warn("Unknown user role:", userRole);
          router.replace("/marketplace");
          break;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      // Invalid user data, redirect to login
      router.replace("/auth/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
