'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  SparklesIcon, 
  UsersIcon, 
  CalendarIcon, 
  MapPinIcon,
  StarIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  WifiIcon,
  CarIcon,
  UtensilsIcon,
  MusicIcon,
  CameraIcon,
  ShieldCheckIcon
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
  features?: string[];
  contact_info?: {
    phone?: string;
    email?: string;
  };
}

const getAmenityIcon = (amenity: string) => {
  const iconMap: Record<string, JSX.Element> = {
    'wifi': <WifiIcon className="h-4 w-4" />,
    'parking': <CarIcon className="h-4 w-4" />,
    'catering': <UtensilsIcon className="h-4 w-4" />,
    'sound_system': <MusicIcon className="h-4 w-4" />,
    'photography': <CameraIcon className="h-4 w-4" />,
    'security': <ShieldCheckIcon className="h-4 w-4" />,
  };
  
  const key = amenity.toLowerCase().replace(/\s+/g, '_');
  return iconMap[key] || <CheckCircleIcon className="h-4 w-4" />;
};

export default function HallDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const hallId = params.id as string;
  
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hallId) {
      fetchHallDetails();
    }
  }, [hallId]);

  const fetchHallDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/halls/${hallId}/`);
      
      if (response.ok) {
        const data = await response.json();
        setHall(data);
      } else if (response.status === 404) {
        setError('Hall not found');
      } else {
        setError('Failed to load hall details');
      }
    } catch (error) {
      console.error('Error fetching hall details:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !hall) {
    return (
      <div className="min-h-screen bg-gray-50">
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
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {error === 'Hall not found' ? 'Hall Not Found' : 'Error Loading Hall'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {error === 'Hall not found' 
                    ? 'The hall you\'re looking for doesn\'t exist or has been removed.' 
                    : 'We couldn\'t load the hall details. Please try again.'}
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/halls">Browse All Halls</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/">Go Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/halls" className="inline-flex items-center text-primary hover:text-primary/80">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to All Halls
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                {hall.image_url ? (
                  <img
                    src={hall.image_url}
                    alt={hall.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <SparklesIcon className="h-24 w-24 text-primary/40" />
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{hall.name}</h1>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {hall.location}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-sm text-gray-600">Up to {hall.capacity} guests</span>
                      </div>
                      {hall.rating && (
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">{hall.rating}</span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({hall.total_reviews || 0} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    From PKR {parseFloat(hall.base_price).toLocaleString()}
                  </Badge>
                </div>
                
                <p className="text-gray-700 leading-relaxed">
                  {hall.description}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {hall.amenities && hall.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities & Features</CardTitle>
                  <CardDescription>
                    Everything you need for a perfect event
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {hall.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-primary">
                          {getAmenityIcon(amenity)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {amenity}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Hall Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Capacity</h4>
                    <p className="text-gray-600">Maximum {hall.capacity} guests</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                    <p className="text-gray-600">{hall.location}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Base Price</h4>
                    <p className="text-gray-600">Starting from PKR {parseFloat(hall.base_price).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Availability</h4>
                    <p className="text-gray-600">
                      {hall.is_active ? (
                        <span className="text-green-600 flex items-center">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Available for booking
                        </span>
                      ) : (
                        <span className="text-red-600">Currently unavailable</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Book This Hall</CardTitle>
                <CardDescription>
                  Reserve {hall.name} for your special event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    PKR {parseFloat(hall.base_price).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Base price</div>
                </div>

                <div className="space-y-3">
                  <Button asChild className="w-full" size="lg">
                    <Link href={`/booking?hall=${hall.id}`}>
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Book Now
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/menu">
                      <UtensilsIcon className="h-4 w-4 mr-2" />
                      View Menu Options
                    </Link>
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    Final pricing will be calculated based on your specific requirements and guest count.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            {hall.contact_info && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hall.contact_info.phone && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Phone</h4>
                        <p className="text-sm text-gray-600">{hall.contact_info.phone}</p>
                      </div>
                    )}
                    {hall.contact_info.email && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Email</h4>
                        <p className="text-sm text-gray-600">{hall.contact_info.email}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                  <div className="text-xs text-gray-500 text-center">
                    Our team is here to help you plan the perfect event
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}