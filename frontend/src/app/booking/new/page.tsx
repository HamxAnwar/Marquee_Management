"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/constants";

interface Venue {
  id: number;
  name: string;
  city: string;
  state: string;
  phone: string;
  email: string;
}

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const venueId = searchParams.get("venue");

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    eventDate: "",
    eventTime: "",
    eventType: "",
    guestCount: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    specialRequirements: "",
  });

  useEffect(() => {
    if (venueId) {
      fetchVenueData();
    } else {
      setLoading(false);
    }
  }, [venueId]);

  const fetchVenueData = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/marketplace/${venueId}/`,
      );
      if (!response.ok) {
        throw new Error("Venue not found");
      }
      const venueData = await response.json();
      setVenue(venueData);
    } catch (err) {
      setError("Failed to load venue information");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    const token = localStorage.getItem("access_token");
    if (!token) {
      // Redirect to login with return URL
      router.push(`/auth/login?redirect=/booking/new?venue=${venueId}`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Simulate API call (replace with actual booking API)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For now, just show success message
      setSuccess(true);
    } catch (err) {
      setError("Failed to submit booking request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking form...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Booking Request Sent!</h1>
            <p className="text-gray-600 mb-6">
              Your booking request has been submitted successfully. The venue
              will contact you within 24 hours to confirm the details.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/marketplace")}
                className="w-full"
              >
                Back to Marketplace
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/bookings")}
                className="w-full"
              >
                View My Bookings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Book Your Event</h1>
              {venue && (
                <p className="text-gray-600">
                  {venue.name} - {venue.city}, {venue.state}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eventDate">Event Date *</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        required
                        value={formData.eventDate}
                        onChange={(e) =>
                          handleInputChange("eventDate", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventTime">Event Time *</Label>
                      <Input
                        id="eventTime"
                        type="time"
                        required
                        value={formData.eventTime}
                        onChange={(e) =>
                          handleInputChange("eventTime", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eventType">Event Type *</Label>
                      <Select
                        value={formData.eventType}
                        onValueChange={(value) =>
                          handleInputChange("eventType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="birthday">
                            Birthday Party
                          </SelectItem>
                          <SelectItem value="corporate">
                            Corporate Event
                          </SelectItem>
                          <SelectItem value="anniversary">
                            Anniversary
                          </SelectItem>
                          <SelectItem value="graduation">Graduation</SelectItem>
                          <SelectItem value="religious">
                            Religious Event
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="guestCount">Number of Guests *</Label>
                      <Input
                        id="guestCount"
                        type="number"
                        required
                        min="1"
                        max="1000"
                        value={formData.guestCount}
                        onChange={(e) =>
                          handleInputChange("guestCount", e.target.value)
                        }
                        placeholder="Enter guest count"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Contact Information
                    </h3>

                    <div>
                      <Label htmlFor="contactName">Full Name *</Label>
                      <Input
                        id="contactName"
                        type="text"
                        required
                        value={formData.contactName}
                        onChange={(e) =>
                          handleInputChange("contactName", e.target.value)
                        }
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactPhone">Phone Number *</Label>
                        <Input
                          id="contactPhone"
                          type="tel"
                          required
                          value={formData.contactPhone}
                          onChange={(e) =>
                            handleInputChange("contactPhone", e.target.value)
                          }
                          placeholder="+92-300-1234567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactEmail">Email Address *</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          required
                          value={formData.contactEmail}
                          onChange={(e) =>
                            handleInputChange("contactEmail", e.target.value)
                          }
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialRequirements">
                      Special Requirements
                    </Label>
                    <Textarea
                      id="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={(e) =>
                        handleInputChange("specialRequirements", e.target.value)
                      }
                      placeholder="Any special requests, dietary requirements, decorations, etc."
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                    size="lg"
                  >
                    {submitting ? "Submitting..." : "Submit Booking Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {venue && (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Venue Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">{venue.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {venue.city}, {venue.state}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">{venue.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">{venue.email}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      What happens next?
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Your request will be sent to the venue</li>
                      <li>• They'll contact you within 24 hours</li>
                      <li>• Discuss pricing and availability</li>
                      <li>• Finalize booking details</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {!venue && !loading && (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">No Venue Selected</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Please select a venue from the marketplace to continue with
                    your booking.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/marketplace">Browse Venues</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
