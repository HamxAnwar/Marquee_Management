'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  SparklesIcon, 
  CalendarIcon, 
  UsersIcon, 
  MapPinIcon,
  ChefHatIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from 'lucide-react';
import { APP_NAME } from '@/constants';
import { format } from 'date-fns';

interface Hall {
  id: number;
  name: string;
  description: string;
  capacity: number;
  base_price: string;
  location: string;
  amenities: string[];
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  category: number;
  is_vegetarian: boolean;
}

interface BookingFormData {
  // Event Details
  hall: string;
  event_date: Date | undefined;
  event_time: string;
  guest_count: string;
  event_type: string;
  
  // Customer Details
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  
  // Menu Selection
  selected_menu_items: number[];
  
  // Additional Details
  special_requests: string;
}

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const preSelectedHall = searchParams.get('hall');
  
  const [formData, setFormData] = useState<BookingFormData>({
    hall: preSelectedHall || '',
    event_date: undefined,
    event_time: '',
    guest_count: '',
    event_type: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    selected_menu_items: [],
    special_requests: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch halls
      const hallsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/halls/`);
      if (hallsResponse.ok) {
        const hallsData = await hallsResponse.json();
        setHalls(hallsData.results || hallsData);
      }

      // Fetch menu items
      const menuResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/items/`);
      if (menuResponse.ok) {
        const menuData = await menuResponse.json();
        setMenuItems(menuData.results || menuData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error loading data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const toggleMenuItem = (itemId: number) => {
    setFormData(prev => ({
      ...prev,
      selected_menu_items: prev.selected_menu_items.includes(itemId)
        ? prev.selected_menu_items.filter(id => id !== itemId)
        : [...prev.selected_menu_items, itemId]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.hall && formData.event_date && formData.event_time && formData.guest_count && formData.event_type);
      case 2:
        return !!(formData.customer_name && formData.customer_email && formData.customer_phone);
      case 3:
        return formData.selected_menu_items.length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      setError('Please fill in all required fields before continuing.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateTotal = () => {
    const selectedHall = halls.find(h => h.id.toString() === formData.hall);
    const hallPrice = selectedHall ? parseFloat(selectedHall.base_price) : 0;
    
    const menuTotal = formData.selected_menu_items.reduce((total, itemId) => {
      const item = menuItems.find(m => m.id === itemId);
      return total + (item ? parseFloat(item.price) : 0);
    }, 0);

    const guestCount = parseInt(formData.guest_count) || 0;
    const menuTotalForGuests = menuTotal * guestCount;
    
    return hallPrice + menuTotalForGuests;
  };

  const submitBooking = async () => {
    setSubmitting(true);
    setError('');

    try {
      const bookingData = {
        hall: parseInt(formData.hall),
        event_date: formData.event_date?.toISOString().split('T')[0],
        event_time: formData.event_time,
        guest_count: parseInt(formData.guest_count),
        event_type: formData.event_type,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        menu_items: formData.selected_menu_items,
        special_requests: formData.special_requests,
        total_price: calculateTotal().toFixed(2)
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Booking submission failed. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Booking Successful!</CardTitle>
            <CardDescription>
              Your event booking has been submitted successfully. We'll contact you within 24 hours to confirm the details.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Booking ID</p>
              <p className="font-mono font-bold">#BK-{Date.now().toString().slice(-6)}</p>
            </div>
            <Button asChild className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedHall = halls.find(h => h.id.toString() === formData.hall);

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
              <Link href="/halls" className="text-gray-600 hover:text-gray-900">Halls</Link>
              <Link href="/menu" className="text-gray-600 hover:text-gray-900">Menu</Link>
              <Link href="/booking" className="text-primary font-medium">Book Now</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 ${
                    step < currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStep === 1 && 'Event Details'}
              {currentStep === 2 && 'Your Information'}
              {currentStep === 3 && 'Menu Selection'}
              {currentStep === 4 && 'Review & Confirm'}
            </h2>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Tell us about your event</h3>
                
                <div>
                  <Label htmlFor="hall">Select Venue *</Label>
                  <Select value={formData.hall} onValueChange={(value) => handleInputChange('hall', value)}>
                    <SelectTrigger>
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Choose a venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {halls.map((hall) => (
                        <SelectItem key={hall.id} value={hall.id.toString()}>
                          {hall.name} - Up to {hall.capacity} guests - ${parseFloat(hall.base_price).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event_date">Event Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.event_date ? format(formData.event_date, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.event_date}
                          onSelect={(date) => handleInputChange('event_date', date)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="event_time">Event Time *</Label>
                    <Input
                      type="time"
                      value={formData.event_time}
                      onChange={(e) => handleInputChange('event_time', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guest_count">Number of Guests *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 100"
                      value={formData.guest_count}
                      onChange={(e) => handleInputChange('guest_count', e.target.value)}
                      min="1"
                      max={selectedHall?.capacity}
                    />
                    {selectedHall && (
                      <p className="text-sm text-gray-500 mt-1">
                        Maximum capacity: {selectedHall.capacity} guests
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="event_type">Event Type *</Label>
                    <Select value={formData.event_type} onValueChange={(value) => handleInputChange('event_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="birthday">Birthday Party</SelectItem>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="graduation">Graduation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Your contact information</h3>
                
                <div>
                  <Label htmlFor="customer_name">Full Name *</Label>
                  <Input
                    placeholder="Your full name"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="customer_email">Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.customer_email}
                    onChange={(e) => handleInputChange('customer_email', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="customer_phone">Phone Number *</Label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Choose your menu items</h3>
                <p className="text-gray-600">Select items for your {formData.guest_count} guests</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {menuItems.filter(item => item.is_available).map((item) => (
                    <Card 
                      key={item.id} 
                      className={`cursor-pointer transition-all ${
                        formData.selected_menu_items.includes(item.id) 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => toggleMenuItem(item.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{item.name}</h4>
                          <Badge variant="secondary">
                            ${parseFloat(item.price).toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant={item.is_vegetarian ? "outline" : "secondary"} className="text-xs">
                            {item.is_vegetarian ? "Vegetarian" : "Non-Veg"}
                          </Badge>
                          {formData.selected_menu_items.includes(item.id) && (
                            <CheckCircleIcon className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Selected: {formData.selected_menu_items.length} items</strong>
                    {formData.selected_menu_items.length > 0 && formData.guest_count && (
                      <span className="ml-2">
                        (Total menu cost: ${(formData.selected_menu_items.reduce((total, itemId) => {
                          const item = menuItems.find(m => m.id === itemId);
                          return total + (item ? parseFloat(item.price) : 0);
                        }, 0) * parseInt(formData.guest_count)).toLocaleString()})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Review your booking</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Event Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Venue:</strong> {selectedHall?.name}</p>
                      <p><strong>Date:</strong> {formData.event_date && format(formData.event_date, 'PPP')}</p>
                      <p><strong>Time:</strong> {formData.event_time}</p>
                      <p><strong>Guests:</strong> {formData.guest_count}</p>
                      <p><strong>Event Type:</strong> {formData.event_type}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {formData.customer_name}</p>
                      <p><strong>Email:</strong> {formData.customer_email}</p>
                      <p><strong>Phone:</strong> {formData.customer_phone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Selected Menu Items ({formData.selected_menu_items.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {formData.selected_menu_items.map(itemId => {
                      const item = menuItems.find(m => m.id === itemId);
                      return item ? (
                        <div key={itemId} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>${parseFloat(item.price).toFixed(2)} per person</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="special_requests">Special Requests (Optional)</Label>
                  <Textarea
                    placeholder="Any special requests or dietary requirements..."
                    value={formData.special_requests}
                    onChange={(e) => handleInputChange('special_requests', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Estimated Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      ${calculateTotal().toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    *Final pricing will be confirmed upon booking approval
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button onClick={nextStep} className="flex items-center">
              Next
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={submitBooking} 
              disabled={submitting}
              className="flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Submit Booking
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}