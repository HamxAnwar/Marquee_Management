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
  User,
  UserCheck,
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

interface Hall {
  id: number;
  name: string;
  description: string;
  capacity: number;
  base_price: string;
  hall_type: string;
  is_active: boolean;
  featured_image?: string;
}

interface MenuPackage {
  id: number;
  name: string;
  description: string;
  package_type: string;
  package_type_display: string;
  base_price_per_person: string;
  min_guests: number;
  max_guests: number | null;
  total_items: number;
  is_active: boolean;
  is_featured: boolean;
  package_items?: any[];
}

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const venueId = searchParams.get("venue");

  const [venue, setVenue] = useState<Venue | null>(null);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [packages, setPackages] = useState<MenuPackage[]>([]);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<MenuPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [isGuestBooking, setIsGuestBooking] = useState(true); // Default to guest booking

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

      // Fetch halls
      try {
        const hallsResponse = await fetch(
          `${API_BASE_URL}/api/marketplace/${venueId}/halls/`,
        );
        if (hallsResponse.ok) {
          const hallsData = await hallsResponse.json();
          setHalls(hallsData);
        }
      } catch (hallsError) {
        console.warn("Halls fetch error:", hallsError);
      }

      // Fetch packages
      try {
        const packagesResponse = await fetch(
          `${API_BASE_URL}/api/marketplace/${venueId}/packages/`,
        );
        if (packagesResponse.ok) {
          const packagesData = await packagesResponse.json();
          setPackages(packagesData);
        }
      } catch (packagesError) {
        console.warn("Packages fetch error:", packagesError);
      }
    } catch (err) {
      setError("Failed to load venue information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (venueId) {
      fetchVenueData();
    } else {
      setLoading(false);
    }
  }, [venueId, fetchVenueData]);



  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For authenticated bookings, check if user is logged in
    const token = localStorage.getItem("access_token");
    if (!isGuestBooking && !token) {
      // Redirect to login with return URL for authenticated bookings
      router.push(`/auth/login?redirect=/booking/new?venue=${venueId}`);
      return;
    }

    setSubmitting(true);
    setError(null);

    // Validation
    if (!selectedHall) {
      setError("Please select a hall.");
      setSubmitting(false);
      return;
    }
    if (parseInt(formData.guestCount) > selectedHall.capacity) {
      setError(`Guest count (${formData.guestCount}) exceeds hall capacity (${selectedHall.capacity}).`);
      setSubmitting(false);
      return;
    }
    if (selectedPackage) {
      if (parseInt(formData.guestCount) < selectedPackage.min_guests ||
          (selectedPackage.max_guests && parseInt(formData.guestCount) > selectedPackage.max_guests)) {
        setError(`Guest count (${formData.guestCount}) doesn't match package range (${selectedPackage.min_guests}${selectedPackage.max_guests ? `-${selectedPackage.max_guests}` : '+'}).`);
        setSubmitting(false);
        return;
      }
    }

    try {
      // Prepare booking data
      const bookingData = {
        organization: venue?.id || venueId, // Use venue.id if available, fallback to venueId
        hall: selectedHall?.id || null,
        selected_package_id: selectedPackage?.id || null,
        event_date: formData.eventDate,
        event_time: formData.eventTime,
        event_type: formData.eventType,
        guest_count: parseInt(formData.guestCount),
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        contact_person_name: formData.contactName,
        special_requirements: formData.specialRequirements,
        booking_source: "website",
        is_guest_booking: isGuestBooking,
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Only add authorization header for authenticated bookings
      if (!isGuestBooking && token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/bookings/bookings/`, {
        method: "POST",
        headers,
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create booking");
      }

      const booking = await response.json();
      console.log("Booking created:", booking);

      setSuccess(true);
    } catch (err) {
      console.error("Booking submission error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit booking request. Please try again."
      );
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
              {isGuestBooking
                ? "Your booking request has been submitted successfully. Check your email for confirmation details. The venue will contact you within 24 hours to confirm the booking."
                : "Your booking request has been submitted successfully. The venue will contact you within 24 hours to confirm the details."
              }
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/marketplace")}
                className="w-full"
              >
                Back to Marketplace
              </Button>
              {!isGuestBooking && (
                <Button
                  variant="outline"
                  onClick={() => router.push("/bookings")}
                  className="w-full"
                >
                  View My Bookings
                </Button>
              )}
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

      {/* Booking Options */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">How would you like to book?</h2>
              <p className="text-gray-600">Choose your preferred booking method</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setIsGuestBooking(true)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  isGuestBooking
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-primary" />
                  <span className="font-medium">Book as Guest</span>
                  {isGuestBooking && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                </div>
                <p className="text-sm text-gray-600">
                  Quick booking without creating an account. You'll receive booking confirmation via email.
                </p>
              </button>

              <button
                onClick={() => setIsGuestBooking(false)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  !isGuestBooking
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  <span className="font-medium">Sign In to Book</span>
                  {!isGuestBooking && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                </div>
                <p className="text-sm text-gray-600">
                  Create an account to manage bookings, view history, and get personalized recommendations.
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
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

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <Label htmlFor="hall">Select Hall *</Label>
                        <Select
                          value={selectedHall?.id.toString() || ""}
                          onValueChange={(value) => {
                            const hall = halls.find(h => h.id.toString() === value);
                            setSelectedHall(hall || null);
                          }}
                        >
                          <SelectTrigger className="w-full overflow-hidden">
                            <SelectValue className="truncate" placeholder="Choose a hall" />
                          </SelectTrigger>
                         <SelectContent>
                           {halls.filter(h => h.is_active).map((hall) => (
                             <SelectItem key={hall.id} value={hall.id.toString()}>
                               {hall.name} - Up to {hall.capacity} guests (PKR {hall.base_price})
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     <div>
                       <Label htmlFor="package">Select Menu Package (Optional)</Label>
                        <Select
                          value={selectedPackage?.id.toString() || ""}
                          onValueChange={(value) => {
                            const pkg = packages.find(p => p.id.toString() === value);
                            setSelectedPackage(pkg || null);
                          }}
                        >
                          <SelectTrigger className="w-full overflow-hidden">
                            <SelectValue className="truncate" placeholder="Choose a menu package" />
                          </SelectTrigger>
                         <SelectContent>
                           {packages.filter(p => p.is_active).map((pkg) => (
                             <SelectItem key={pkg.id} value={pkg.id.toString()}>
                               {pkg.name} - PKR {pkg.base_price_per_person}/person ({pkg.min_guests}{pkg.max_guests ? `-${pkg.max_guests}` : '+'} guests)
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
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
