"use client";

import { useAuthCheck } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({
  children,
  requiredRoles,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuthCheck();
  const router = useRouter();

  // Check for access_token instead of marquee_auth_token
  const hasToken =
    typeof window !== "undefined" && localStorage.getItem("access_token");

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !isLoading &&
      !isAuthenticated &&
      !hasToken
    ) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, hasToken, router]);

  // Show loading during initial render or when checking auth
  if (typeof window === "undefined" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !hasToken) {
    if (typeof window !== "undefined") {
      router.push("/auth/login");
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    const getRoleBasedRedirect = () => {
      switch (user.role) {
        case "platform_admin":
          return () => (window.location.href = "http://localhost:8000/admin");
        case "venue_owner":
          return () => router.push("/admin");
        case "customer":
          return () => router.push("/marketplace");
        default:
          return () => router.push("/");
      }
    };

    const handleRedirect = getRoleBasedRedirect();

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Your current role is{" "}
            <span className="font-semibold">{user.role}</span>.
            {requiredRoles && requiredRoles.length > 0 && (
              <>
                <br />
                Required roles: {requiredRoles.join(", ")}
              </>
            )}
          </p>
          <div className="space-y-3">
            <Button onClick={handleRedirect} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to My Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/auth/login")}
              className="w-full"
            >
              Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
