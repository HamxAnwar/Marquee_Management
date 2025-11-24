"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  SearchIcon,
  MapPinIcon,
  StarIcon,
  FilterIcon,
  HeartIcon,
  ShareIcon,
  BuildingIcon,
  CheckCircleIcon,
  WifiIcon,
  CarIcon,
  UtensilsIcon,
  MusicIcon,
  Loader2Icon,
} from "lucide-react";
import { APP_NAME } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { marketplaceApi } from "@/services/marketplace";
import type { Organization } from "@/types";

const amenityLabels = {
  parking: "Parking",
  ac: "Air Conditioning",
  kitchen: "Kitchen",
  sound: "Sound System",
  stage: "Stage",
};

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCapacity, setSelectedCapacity] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popularity");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch organizations from API
  const { data: organizationsData, isLoading, error } = useQuery({
    queryKey: ['marketplace-organizations'],
    queryFn: () => marketplaceApi.getOrganizations(),
  });

  const organizations = organizationsData?.results || [];

  // Transform organizations to venue-like structure for filtering
  const venues = organizations.map((org: Organization) => ({
    id: org.id,
    name: org.name,
    organization: org.name,
    city: org.city,
    area: org.state || org.city,
    rating: org.avg_rating || 0,
    reviewCount: org.total_bookings,
    minPrice: 0, // We'll need to get this from halls
    maxPrice: 0,
    capacity: 0, // We'll need to get this from halls
    images: [org.cover_image || "/api/placeholder/400/300"],
    amenities: [], // We'll need to get this from halls
    isVerified: org.status === 'active',
    isPopular: org.total_bookings > 5,
    description: org.description,
    totalHalls: org.total_halls,
  }));

  const cities = [...new Set(venues.map((venue) => venue.city))];
  const capacityRanges = [
    { label: "Up to 100", value: "0-100" },
    { label: "100 - 300", value: "100-300" },
    { label: "300 - 500", value: "300-500" },
    { label: "500+", value: "500+" },
  ];
  const priceRanges = [
    { label: "Under 25K", value: "0-25000" },
    { label: "25K - 40K", value: "25000-40000" },
    { label: "40K - 60K", value: "40000-60000" },
    { label: "60K+", value: "60000+" },
  ];

  const filteredVenues = useMemo(() => {
    if (!venues.length) return [];

    const filtered = venues.filter((venue) => {
      // Search query filter
      if (
        searchQuery &&
        !venue.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !venue.organization.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !venue.area.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // City filter
      if (
        selectedCity &&
        selectedCity !== "all" &&
        venue.city !== selectedCity
      ) {
        return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "popularity":
        default:
          return (
            (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || b.rating - a.rating
          );
      }
    });

    return filtered;
  }, [
    venues,
    searchQuery,
    selectedCity,
    sortBy,
  ]);

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenity]);
    } else {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCity("all");
    setSelectedCapacity("all");
    setPriceRange("all");
    setSelectedAmenities([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">{APP_NAME}</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <div className="container py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search venues, organizations, areas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                <FilterIcon className="mr-2 h-4 w-4" />
                Filters
                {(selectedCapacity ||
                  priceRange ||
                  selectedAmenities.length > 0) && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-5 w-5 rounded-full p-0"
                  >
                    {
                      [
                        selectedCapacity,
                        priceRange,
                        ...selectedAmenities,
                      ].filter(Boolean).length
                    }
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Capacity
                  </Label>
                  <Select
                    value={selectedCapacity}
                    onValueChange={setSelectedCapacity}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any capacity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any capacity</SelectItem>
                      {capacityRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Price Range
                  </Label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any price</SelectItem>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm font-medium mb-2 block">
                    Amenities
                  </Label>
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(amenityLabels).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={selectedAmenities.includes(key)}
                          onCheckedChange={(checked) =>
                            handleAmenityChange(key, checked as boolean)
                          }
                        />
                        <Label htmlFor={key} className="text-sm">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Event Venues</h1>
            <p className="text-muted-foreground">
              {isLoading ? "Loading venues..." : `${filteredVenues.length} venue${filteredVenues.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading venues...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <BuildingIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load venues</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading the venue data. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* Venues Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <Card
                key={venue.id}
                className="group hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={venue.images[0]}
                    alt={venue.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-3 left-3 flex gap-1">
                    {venue.isPopular && (
                      <Badge className="bg-primary text-primary-foreground">
                        Popular
                      </Badge>
                    )}
                    {venue.isVerified && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <HeartIcon className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <ShareIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-lg leading-none">
                        {venue.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {venue.totalHalls} hall{venue.totalHalls !== 1 ? 's' : ''} available
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-sm">
                      <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {venue.city}, {venue.state || venue.country}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {venue.rating > 0 ? venue.rating.toFixed(1) : 'New'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({venue.reviewCount} booking{venue.reviewCount !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {venue.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Contact: {venue.organization}
                        </span>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/marketplace/${venue.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && filteredVenues.length === 0 && (
          <div className="text-center py-12">
            <BuildingIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No venues found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={clearFilters}>Clear All Filters</Button>
          </div>
        )}

        {/* Pagination */}
        {filteredVenues.length > 12 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              <Button variant="outline" disabled>
                Previous
              </Button>
              <Button
                variant="outline"
                className="bg-primary text-primary-foreground"
              >
                1
              </Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
