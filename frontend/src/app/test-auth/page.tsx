"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/services/auth";

export default function TestAuthPage() {
  const [username, setUsername] = useState("customer");
  const [password, setPassword] = useState("customer123");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const testLogin = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      console.log("Testing login with:", { username, password });
      console.log(
        "API Base URL:",
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
      );

      const response = await authApi.login({
        username,
        password,
      });

      console.log("Login response:", response);
      setResult(JSON.stringify(response, null, 2));
    } catch (err: any) {
      console.error("Login error:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);

      if (err.response) {
        setError(
          `HTTP ${err.response.status}: ${err.response.statusText}\n${JSON.stringify(err.response.data, null, 2)}`,
        );
      } else if (err.request) {
        setError(`Network Error: No response received\n${err.message}`);
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      console.log("Direct fetch response status:", response.status);
      console.log("Direct fetch response headers:", response.headers);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Direct fetch response data:", data);
      setResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error("Direct fetch error:", err);
      setError(`Direct fetch error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setResult("✅ All tokens and user data cleared!");
    setError("");
  };

  const testRoleBasedRouting = () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      setError("No user data found. Please login first.");
      return;
    }

    try {
      const user = JSON.parse(userData);
      const role = user.role;

      let redirectUrl = "";
      switch (role) {
        case "platform_admin":
          redirectUrl = "http://localhost:8000/admin";
          break;
        case "venue_owner":
          redirectUrl = "http://localhost:3000/admin";
          break;
        case "customer":
          redirectUrl = "http://localhost:3000/marketplace";
          break;
        default:
          redirectUrl = "http://localhost:3000";
          break;
      }

      setResult(
        `Role: ${role}\nShould redirect to: ${redirectUrl}\n\nUser data:\n${JSON.stringify(user, null, 2)}`,
      );

      // Optional: Actually redirect after 3 seconds
      setTimeout(() => {
        if (role === "platform_admin") {
          window.location.href = redirectUrl;
        } else {
          window.location.href = redirectUrl;
        }
      }, 3000);
    } catch (err) {
      setError("Error parsing user data: " + err.message);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={testLogin} disabled={loading}>
                {loading ? "Testing..." : "Test Auth Service"}
              </Button>
              <Button
                onClick={testDirectFetch}
                disabled={loading}
                variant="outline"
              >
                {loading ? "Testing..." : "Test Direct Fetch"}
              </Button>
            </div>

            <div className="flex gap-2 mt-2">
              <Button onClick={clearTokens} variant="destructive" size="sm">
                Clear All Tokens
              </Button>
              <Button
                onClick={testRoleBasedRouting}
                variant="secondary"
                size="sm"
              >
                Test Role Routing
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                API Base URL:{" "}
                {process.env.NEXT_PUBLIC_API_BASE_URL ||
                  "http://localhost:8000"}
              </p>
              <p>Current time: {new Date().toISOString()}</p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-red-700 whitespace-pre-wrap text-sm">
                {error}
              </pre>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Success</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-green-700 whitespace-pre-wrap text-sm">
                {result}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Demo Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Customer:</strong> customer / customer123
            </p>
            <p className="text-green-600">→ Should redirect to: /marketplace</p>
            <p>
              <strong>Venue Owner:</strong> venue_owner / owner123
            </p>
            <p className="text-blue-600">→ Should redirect to: /admin</p>
            <p>
              <strong>Platform Admin:</strong> admin / admin123
            </p>
            <p className="text-purple-600">
              → Should redirect to: http://localhost:8000/admin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Token Status</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              <strong>Access Token:</strong>{" "}
              {typeof window !== "undefined" &&
              localStorage.getItem("access_token")
                ? "✅ Present"
                : "❌ Missing"}
            </p>
            <p>
              <strong>Refresh Token:</strong>{" "}
              {typeof window !== "undefined" &&
              localStorage.getItem("refresh_token")
                ? "✅ Present"
                : "❌ Missing"}
            </p>
            <p>
              <strong>User Data:</strong>{" "}
              {typeof window !== "undefined" && localStorage.getItem("user")
                ? "✅ Present"
                : "❌ Missing"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
