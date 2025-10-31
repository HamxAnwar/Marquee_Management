"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/constants";

export default function TestApiPage() {
  const [venueId, setVenueId] = useState("1");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testVenueAPI = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      console.log("Testing venue API for ID:", venueId);

      const response = await fetch(
        `${API_BASE_URL}/api/marketplace/${venueId}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Success data:", data);
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const testHallsAPI = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      console.log("Testing halls API for venue ID:", venueId);

      const response = await fetch(
        `${API_BASE_URL}/api/marketplace/${venueId}/halls/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Halls response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Halls error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Halls success data:", data);
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Halls fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const testMenuAPI = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      console.log("Testing menu API for venue ID:", venueId);

      const response = await fetch(
        `${API_BASE_URL}/api/marketplace/${venueId}/menu/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Menu response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Menu error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Menu success data:", data);
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Menu fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const testMarketplaceAPI = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      console.log("Testing marketplace API (list all venues)");

      const response = await fetch(`${API_BASE_URL}/api/marketplace/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Marketplace response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Marketplace error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Marketplace success data:", data);
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Marketplace fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const testCORS = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      console.log("Testing CORS with OPTIONS request");

      const response = await fetch(
        `${API_BASE_URL}/api/marketplace/${venueId}/`,
        {
          method: "OPTIONS",
        },
      );

      console.log("CORS OPTIONS response status:", response.status);
      console.log(
        "CORS headers:",
        Object.fromEntries(response.headers.entries()),
      );

      const result = {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      };

      setResult(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error("CORS test error:", err);
      setError(err instanceof Error ? err.message : "CORS test failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>API Testing Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="venueId">Venue ID</Label>
              <Input
                id="venueId"
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                placeholder="Enter venue ID (e.g., 1)"
                className="mt-1"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={testVenueAPI} disabled={loading}>
                {loading ? "Testing..." : "Test Venue API"}
              </Button>
              <Button
                onClick={testHallsAPI}
                disabled={loading}
                variant="outline"
              >
                {loading ? "Testing..." : "Test Halls API"}
              </Button>
              <Button
                onClick={testMenuAPI}
                disabled={loading}
                variant="outline"
              >
                {loading ? "Testing..." : "Test Menu API"}
              </Button>
              <Button
                onClick={testMarketplaceAPI}
                disabled={loading}
                variant="secondary"
              >
                {loading ? "Testing..." : "Test Marketplace API"}
              </Button>
              <Button
                onClick={testCORS}
                disabled={loading}
                variant="destructive"
              >
                {loading ? "Testing..." : "Test CORS"}
              </Button>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Backend Status:</strong>{" "}
                {navigator.onLine ? "Online" : "Offline"}
              </p>
              <p>
                <strong>Current URL:</strong>{" "}
                {typeof window !== "undefined" ? window.location.href : "N/A"}
              </p>
              <p>
                <strong>User Agent:</strong>{" "}
                {typeof window !== "undefined"
                  ? navigator.userAgent.substring(0, 50) + "..."
                  : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-red-700 whitespace-pre-wrap text-sm overflow-auto">
                {error}
              </pre>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Success Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-green-700 whitespace-pre-wrap text-sm overflow-auto max-h-96">
                {result}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p>
                1. <strong>Test Venue API:</strong> Tests individual venue
                endpoint
              </p>
              <p>
                2. <strong>Test Halls API:</strong> Tests venue halls endpoint
              </p>
              <p>
                3. <strong>Test Menu API:</strong> Tests venue menu endpoint
              </p>
              <p>
                4. <strong>Test Marketplace API:</strong> Tests venue listing
                endpoint
              </p>
              <p>
                5. <strong>Test CORS:</strong> Tests cross-origin request
                headers
              </p>
              <p>
                6. <strong>Check Browser Console:</strong> Open DevTools &gt;
                Console for detailed logs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
