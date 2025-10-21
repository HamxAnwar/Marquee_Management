'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  SparklesIcon, 
  UsersIcon, 
  CalendarIcon, 
  MapPinIcon,
  StarIcon,
  FilterIcon,
  SearchIcon
} from 'lucide-react';
import { APP_NAME } from '@/constants';

interface Hall {
  id: number;
  name: string;
  description: string;
  capacity: number;
  base_price: string;
  location: string;
  amenities: string[];
  image_url?: string;
  is_active: boolean;
  rating?: number;
  total_reviews?: number;
}

export default function HallsPage() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [capacityFilter, setCapacityFilter] = useState('');

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/halls/`);
      if (response.ok) {
        const data = await response.json();
        setHalls(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching halls:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedHalls = halls
    .filter(hall => {
      const matchesSearch = hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hall.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hall.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCapacity = !capacityFilter || capacityFilter === 'all' || 
                             (capacityFilter === 'small' && hall.capacity <= 50) ||
                             (capacityFilter === 'medium' && hall.capacity > 50 && hall.capacity <= 150) ||
                             (capacityFilter === 'large' && hall.capacity > 150);

      return matchesSearch && matchesCapacity && hall.is_active;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseFloat(a.base_price) - parseFloat(b.base_price);
        case 'capacity':
          return a.capacity - b.capacity;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <SparklesIcon className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">{APP_NAME}</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/halls" className="text-primary font-medium">Halls</Link>
              <Link href="/menu" className="text-gray-600 hover:text-gray-900">Menu</Link>
              <Link href="/booking" className="text-gray-600 hover:text-gray-900">Book Now</Link>
            </nav>
            <div className="flex space-x-2">
              <Button asChild variant="ghost">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Beautiful Venues</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the perfect venue for your special event. From intimate gatherings to grand celebrations.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search halls by name, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={capacityFilter} onValueChange={setCapacityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <FilterIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Capacities</SelectItem>
                <SelectItem value="small">Small (up to 50)</SelectItem>
                <SelectItem value="medium">Medium (51-150)</SelectItem>
                <SelectItem value="large">Large (150+)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="capacity">Capacity</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredAndSortedHalls.length} of {halls.length} venues
          </p>
        </div>

        {/* Halls Grid */}
        {filteredAndSortedHalls.length === 0 ? (
          <div className="text-center py-12">
            <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No venues found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedHalls.map((hall) => (
              <Card key={hall.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  {hall.image_url ? (
                    <img
                      src={hall.image_url}
                      alt={hall.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <SparklesIcon className="h-16 w-16 text-primary/40" />
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{hall.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {hall.location}
                      </CardDescription>
                    </div>
                    {hall.rating && (
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{hall.rating}</span>
                        <span className="text-xs text-gray-500">
                          ({hall.total_reviews || 0})
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {hall.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <UsersIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Up to {hall.capacity} guests
                      </span>
                    </div>
                    <Badge variant="secondary">
                      From PKR {parseFloat(hall.base_price).toLocaleString()}
                    </Badge>
                  </div>

                  {hall.amenities && hall.amenities.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {hall.amenities.slice(0, 3).map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {hall.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{hall.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button asChild className="flex-1">
                      <Link href={`/booking?hall=${hall.id}`}>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Book Now
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={`/halls/${hall.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Didn't find the perfect venue?
          </h2>
          <p className="text-gray-600 mb-6">
            Contact us for custom recommendations or to discuss your specific needs.
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/menu">Browse Menu Options</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}