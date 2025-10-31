"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Star,
  Calendar,
  Clock,
  ArrowLeft,
  Heart,
  Share2,
  CheckCircle,
  Wifi,
  Car,
  Utensils,
  Music,
  Camera,
} from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/constants";

interface Venue {
  id: number;
  name: string;
  description: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  owner: {
    first_name: string;
    last_name: string;
  };
  total_halls: number;
  total_bookings: number;
  avg_rating?: number;
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

interface MenuCategory {
  id: number;
  name: string;
  description: string;
  items_count: number;
}

// Mock additional data that we don't have in API yet
const mockAdditionalData = {
  rating: 4.8,
  reviewCount: 127,
  images: [
    "https://images.unsplash.com/photo-1519167758481-83f29c8e8d4a?w=800&h=400&fit=crop",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop",
  ],
  amenities: [
    { icon: Car, label: "Free Parking" },
    { icon: Wifi, label: "Free WiFi" },
    { icon: Utensils, label: "Catering Kitchen" },
    { icon: Music, label: "Sound System" },
    { icon: Camera, label: "Photography Area" },
  ],
  halls: [
    {
      id: 1,
      name: "Grand Ballroom",
      capacity: 500,
      price: "PKR 45,000",
      description:
        "Elegant indoor ballroom perfect for weddings and formal events",
      features: ["AC", "Stage", "Sound System", "Parking"],
    },
    {
      id: 2,
      name: "Garden Lawn",
      capacity: 300,
      price: "PKR 25,000",
      description: "Beautiful outdoor garden setting for intimate celebrations",
      features: ["Garden Setting", "Sound System", "Parking"],
    },
  ],
  menuCategories: [
    {
      name: "Appetizers",
      items: [
        { name: "Chicken Wings", price: "PKR 800/plate" },
        { name: "Vegetable Spring Rolls", price: "PKR 600/plate" },
      ],
    },
    {
      name: "Main Course",
      items: [
        { name: "Chicken Karahi", price: "PKR 1,200/plate" },
        { name: "Mutton Pulao", price: "PKR 1,500/plate" },
      ],
    },
    {
      name: "Desserts",
      items: [
        { name: "Kheer", price: "PKR 300/plate" },
        { name: "Gulab Jamun", price: "PKR 250/plate" },
      ],
    },
  ],
  reviews: [
    {
      id: 1,
      customerName: "Sarah Ahmed",
      rating: 5,
      date: "2024-01-15",
      comment:
        "Absolutely wonderful venue! The Grand Ballroom was perfect for our wedding.",
    },
    {
      id: 2,
      customerName: "Ali Hassan",
      rating: 4,
      date: "2024-01-10",
      comment:
        "Great service and beautiful garden setting. Highly recommended!",
    },
  ],
};

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id;

  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get venue data with fallbacks and error handling
  const venueData = venue
    ? {
        ...venue,
        images: mockAdditionalData.images,
        amenities: mockAdditionalData.amenities,
        rating: venue.avg_rating || mockAdditionalData.rating,
        reviewCount: venue.total_bookings || mockAdditionalData.reviewCount,
        priceRange:
          halls && halls.length > 0
            ? (() => {
                const prices = halls
                  .map((h) => parseInt(h.base_price) || 0)
                  .filter((p) => p > 0);
                return prices.length > 0
                  ? `PKR ${Math.min(...prices)} - ${Math.max(...prices)}`
                  : "Contact for pricing";
              })()
            : "Contact for pricing",
      }
    : null;

  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setLoading(true);
        console.log("Fetching venue data for ID:", venueId);

        // Fetch venue details
        const venueResponse = await fetch(
          `${API_BASE_URL}/api/marketplace/${venueId}/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        console.log("Venue response status:", venueResponse.status);
        console.log("Venue response ok:", venueResponse.ok);

        if (!venueResponse.ok) {
          const errorText = await venueResponse.text();
          console.error("Venue fetch error:", errorText);
          throw new Error(`Venue not found (${venueResponse.status})`);
        }

        const venueData = await venueResponse.json();
        console.log("Venue data received:", venueData);
        setVenue(venueData);

        // Fetch halls
        try {
          const hallsResponse = await fetch(
            `${API_BASE_URL}/api/marketplace/${venueId}/halls/`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
          if (hallsResponse.ok) {
            const hallsData = await hallsResponse.json();
            console.log("Halls data received:", hallsData);
            setHalls(hallsData);
          } else {
            console.warn("Failed to fetch halls:", hallsResponse.status);
          }
        } catch (hallsError) {
          console.warn("Halls fetch error:", hallsError);
        }

        // Fetch menu
        try {
          const menuResponse = await fetch(
            `${API_BASE_URL}/api/marketplace/${venueId}/menu/`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
          if (menuResponse.ok) {
            const menuData = await menuResponse.json();
            console.log("Menu data received:", menuData);
            setMenuCategories(menuData);
          } else {
            console.warn("Failed to fetch menu:", menuResponse.status);
          }
        } catch (menuError) {
          console.warn("Menu fetch error:", menuError);
        }
      } catch (err) {
        console.error("Main fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load venue data",
        );
      } finally {
        setLoading(false);
      }
    };

    if (venueId) {
      fetchVenueData();
    }
  }, [venueId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (error || (!loading && !venue)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Venue Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "The venue you are looking for does not exist."}
          </p>
          <div className="text-sm text-gray-500 mb-4">Venue ID: {venueId}</div>
          <div className="space-y-2">
            <Button onClick={() => router.push("/marketplace")}>
              Back to Marketplace
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    // Redirect to booking form or login if not authenticated
    router.push(`/booking/new?venue=${venueId}`);
  };

  const handleContactVenue = () => {
    // Open contact modal or redirect to contact form
    window.open(`tel:${venue.phone}`, "_self");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Images */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div className="aspect-[16/10] rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={
                    venueData?.images[selectedImage] ||
                    "https://images.unsplash.com/photo-1519167758481-83f29c8e8d4a?w=800&h=400&fit=crop"
                  }
                  alt={venue?.name || "Venue"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/800x400/e5e7eb/9ca3af?text=Venue+Image";
                  }}
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(venueData?.images || []).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 bg-gray-200 ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${venue?.name || "Venue"} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/200x200/e5e7eb/9ca3af?text=Image";
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Venue Info Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {venue?.name || "Venue"}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">
                          {venueData?.rating || 0}
                        </span>
                        <span className="text-gray-600">
                          ({venueData?.reviewCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {venue?.city}, {venue?.state}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFavorited(!isFavorited)}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorited ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Halls</div>
                  <div className="text-lg font-semibold">
                    {venue?.total_halls || 0} Hall
                    {(venue?.total_halls || 0) !== 1 ? "s" : ""} Available
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">
                      {venue?.phone || "Contact for phone"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">
                      {venue?.email || "Contact for email"}
                    </span>
                  </div>
                  {venue?.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">{venue.website}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button onClick={handleBookNow} className="w-full" size="lg">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                  <Button
                    onClick={handleContactVenue}
                    variant="outline"
                    className="w-full"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Venue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Details Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="halls">Halls</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {venue?.name || "This Venue"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {venue?.description ||
                      "No description available for this venue."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {(venueData?.amenities || []).map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <amenity.icon className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">
                          {amenity.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span>
                        {venue?.address || `${venue?.city}, ${venue?.state}`}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {venue?.city}, {venue?.state}, {venue?.country}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="halls" className="space-y-6">
              <div className="grid gap-6">
                {halls.length > 0 ? (
                  halls.map((hall) => (
                    <Card key={hall.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold">
                              {hall.name}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              {hall.description}
                            </p>
                            <Badge variant="outline" className="mt-2">
                              {hall.hall_type}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              PKR {hall.base_price}
                            </div>
                            <div className="text-sm text-gray-600">
                              base price
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-600" />
                            <span className="text-sm">
                              Up to {hall.capacity} guests
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {hall.is_active ? "Available" : "Not Available"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      No halls information available.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="menu" className="space-y-6">
              <div className="space-y-6">
                {menuCategories.length > 0 ? (
                  menuCategories.map((category, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle>{category.name}</CardTitle>
                        {category.description && (
                          <p className="text-gray-600">
                            {category.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-4">
                          <p className="text-gray-600">
                            {category.items_count} items available in this
                            category
                          </p>
                          <Button variant="outline" className="mt-2">
                            View Menu Items
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      No menu information available.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="space-y-4">
                {mockAdditionalData.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium">
                            {review.customerName}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button variant="outline">Load More Reviews</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
