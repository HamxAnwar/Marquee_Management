"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  UsersIcon,
  FilterIcon,
  HeartIcon,
  ShareIcon,
  BuildingIcon,
  CheckCircleIcon,
  WifiIcon,
  CarIcon,
  UtensilsIcon,
  MusicIcon,
} from "lucide-react";
import { APP_NAME } from "@/constants";

// Mock data for venues
const mockVenues = [
  {
    id: 1,
    name: "Royal Gardens Marquee",
    organization: "Elegant Events Co.",
    city: "Karachi",
    area: "Clifton",
    rating: 4.8,
    reviewCount: 124,
    minPrice: 25000,
    maxPrice: 45000,
    capacity: 500,
    images: ["/api/placeholder/400/300"],
    amenities: ["parking", "ac", "kitchen", "sound"],
    isVerified: true,
    isPopular: true,
    description: "Luxurious outdoor venue with beautiful garden settings",
  },
  {
    id: 2,
    name: "Grand Ballroom Hall",
    organization: "Premium Venues Ltd.",
    city: "Lahore",
    area: "DHA Phase 5",
    rating: 4.6,
    reviewCount: 89,
    minPrice: 35000,
    maxPrice: 55000,
    capacity: 300,
    images: ["/api/placeholder/400/300"],
    amenities: ["ac", "sound", "stage"],
    isVerified: true,
    isPopular: false,
    description: "Modern indoor hall perfect for weddings and corporate events",
  },
  {
    id: 3,
    name: "Heritage Palace",
    organization: "Royal Venues",
    city: "Islamabad",
    area: "F-7",
    rating: 4.9,
    reviewCount: 156,
    minPrice: 40000,
    maxPrice: 70000,
    capacity: 600,
    images: ["/api/placeholder/400/300"],
    amenities: ["parking", "ac", "kitchen", "sound", "stage"],
    isVerified: true,
    isPopular: true,
    description: "Elegant heritage-style venue with traditional architecture",
  },
  {
    id: 4,
    name: "Sunset Lawn",
    organization: "Garden Events",
    city: "Quetta",
    area: "Cantonment",
    rating: 4.4,
    reviewCount: 67,
    minPrice: 20000,
    maxPrice: 35000,
    capacity: 400,
    images: ["/api/placeholder/400/300"],
    amenities: ["parking", "sound"],
    isVerified: true,
    isPopular: false,
    description: "Beautiful outdoor lawn venue with mountain views",
  },
  {
    id: 5,
    name: "Crystal Convention Center",
    organization: "Modern Events",
    city: "Karachi",
    area: "Gulshan-e-Iqbal",
    rating: 4.7,
    reviewCount: 203,
    minPrice: 30000,
    maxPrice: 50000,
    capacity: 800,
    images: ["/api/placeholder/400/300"],
    amenities: ["parking", "ac", "kitchen", "sound", "stage"],
    isVerified: true,
    isPopular: true,
    description: "State-of-the-art convention center for large events",
  },
  {
    id: 6,
    name: "Riverside Marquee",
    organization: "Waterfront Venues",
    city: "Lahore",
    area: "Ravi Road",
    rating: 4.3,
    reviewCount: 45,
    minPrice: 18000,
    maxPrice: 28000,
    capacity: 250,
    images: ["/api/placeholder/400/300"],
    amenities: ["parking", "sound"],
    isVerified: false,
    isPopular: false,
    description: "Charming riverside venue perfect for intimate celebrations",
  },
];

const amenityIcons = {
  parking: CarIcon,
  ac: WifiIcon, // Using WiFi icon as AC placeholder
  kitchen: UtensilsIcon,
  sound: MusicIcon,
  stage: BuildingIcon,
};

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

  const cities = [...new Set(mockVenues.map((venue) => venue.city))];
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
    let filtered = mockVenues.filter((venue) => {
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

      // Capacity filter
      if (selectedCapacity && selectedCapacity !== "all") {
        const [min, max] = selectedCapacity.split("-").map(Number);
        if (max) {
          if (venue.capacity < min || venue.capacity > max) return false;
        } else {
          if (venue.capacity < min) return false;
        }
      }

      // Price range filter
      if (priceRange && priceRange !== "all") {
        const [min, max] = priceRange.split("-").map(Number);
        if (max) {
          if (venue.maxPrice < min || venue.minPrice > max) return false;
        } else {
          if (venue.maxPrice < min) return false;
        }
      }

      // Amenities filter
      if (selectedAmenities.length > 0) {
        if (
          !selectedAmenities.every((amenity) =>
            venue.amenities.includes(amenity),
          )
        ) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.minPrice - b.minPrice;
        case "price-high":
          return b.minPrice - a.minPrice;
        case "rating":
          return b.rating - a.rating;
        case "capacity":
          return b.capacity - a.capacity;
        case "popularity":
        default:
          return (
            (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || b.rating - a.rating
          );
      }
    });

    return filtered;
  }, [
    searchQuery,
    selectedCity,
    selectedCapacity,
    priceRange,
    selectedAmenities,
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
              {filteredVenues.length} venue
              {filteredVenues.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="capacity">Largest Capacity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Venues Grid */}
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
                      {venue.organization}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-sm">
                    <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {venue.area}, {venue.city}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {venue.rating}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({venue.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <UsersIcon className="h-4 w-4" />
                      <span>Up to {venue.capacity}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {venue.description}
                  </p>

                  <div className="flex items-center gap-2 py-2">
                    {venue.amenities.slice(0, 4).map((amenity) => {
                      const IconComponent =
                        amenityIcons[amenity as keyof typeof amenityIcons];
                      return IconComponent ? (
                        <div
                          key={amenity}
                          className="flex items-center gap-1 text-xs text-muted-foreground"
                        >
                          <IconComponent className="h-3 w-3" />
                          <span className="sr-only">
                            {
                              amenityLabels[
                                amenity as keyof typeof amenityLabels
                              ]
                            }
                          </span>
                        </div>
                      ) : null;
                    })}
                    {venue.amenities.length > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{venue.amenities.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <span className="text-lg font-bold">
                        PKR {venue.minPrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {" "}
                        onwards
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

        {/* No Results */}
        {filteredVenues.length === 0 && (
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
