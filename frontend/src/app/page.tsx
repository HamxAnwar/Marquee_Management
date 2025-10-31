"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CalendarIcon,
  UsersIcon,
  ChefHatIcon,
  CreditCardIcon,
  SparklesIcon,
  ClockIcon,
  SearchIcon,
  MapPinIcon,
  StarIcon,
  BuildingIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
} from "lucide-react";
import { APP_NAME, COMPANY_NAME } from "@/constants";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const features = [
    {
      icon: <SearchIcon className="h-8 w-8 text-primary" />,
      title: "Discover Venues",
      description:
        "Browse hundreds of verified venues across Pakistan with real photos and reviews",
    },
    {
      icon: <CalendarIcon className="h-8 w-8 text-primary" />,
      title: "Easy Booking",
      description:
        "Book your perfect venue in minutes with instant confirmation and secure payments",
    },
    {
      icon: <ChefHatIcon className="h-8 w-8 text-primary" />,
      title: "Complete Catering",
      description:
        "Choose from diverse menu options or get personalized suggestions within your budget",
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8 text-primary" />,
      title: "Verified Partners",
      description:
        "All venues are thoroughly verified for quality, safety, and service standards",
    },
    {
      icon: <CreditCardIcon className="h-8 w-8 text-primary" />,
      title: "Transparent Pricing",
      description:
        "No hidden fees. See real-time pricing with guest-based discounts and clear breakdowns",
    },
    {
      icon: <ClockIcon className="h-8 w-8 text-primary" />,
      title: "24/7 Support",
      description:
        "Get help whenever you need it with our dedicated customer support team",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Ahmed",
      event: "Wedding Reception",
      location: "Karachi",
      rating: 5,
      comment:
        "Found the perfect venue for our wedding. The platform made comparison so easy!",
    },
    {
      name: "Hassan Ali",
      event: "Corporate Event",
      location: "Lahore",
      rating: 5,
      comment:
        "Excellent service and transparent pricing. Our event was a huge success!",
    },
    {
      name: "Fatima Khan",
      event: "Birthday Party",
      location: "Islamabad",
      rating: 5,
      comment:
        "Great variety of venues and the booking process was incredibly smooth.",
    },
  ];

  const popularCities = [
    { name: "Karachi", venues: 150, image: "/images/cities/karachi.jpg" },
    { name: "Lahore", venues: 120, image: "/images/cities/lahore.jpg" },
    { name: "Islamabad", venues: 80, image: "/images/cities/islamabad.jpg" },
    { name: "Quetta", venues: 45, image: "/images/cities/quetta.jpg" },
    { name: "Peshawar", venues: 35, image: "/images/cities/peshawar.jpg" },
    { name: "Multan", venues: 25, image: "/images/cities/multan.jpg" },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (searchLocation) params.set("location", searchLocation);

    window.location.href = `/marketplace?${params.toString()}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <SparklesIcon className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">{APP_NAME}</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                className="transition-colors hover:text-foreground/80"
                href="/marketplace"
              >
                Browse Venues
              </Link>
              <Link
                className="transition-colors hover:text-foreground/80"
                href="/how-it-works"
              >
                How it Works
              </Link>
              <Link
                className="transition-colors hover:text-foreground/80"
                href="/become-partner"
              >
                List Your Venue
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-2">
              <Button asChild variant="ghost">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24 lg:py-32">
        <div className="container relative">
          <div className="flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto">
            <Badge variant="outline" className="text-sm mb-4">
              Pakistan's #1 Event Venue Platform
            </Badge>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
              Find Your Perfect
              <br className="hidden sm:inline" />
              <span className="text-primary">Event Venue</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Discover and book amazing venues for weddings, celebrations, and
              corporate events. Compare prices, read reviews, and book with
              confidence.
            </p>

            {/* Search Section */}
            <div className="w-full max-w-4xl mt-8">
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search venues, event types..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="City, area..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    size="lg"
                    className="h-12 px-8"
                  >
                    <SearchIcon className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </Card>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 w-full max-w-3xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">
                  Verified Venues
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">
                  Happy Customers
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">25+</div>
                <div className="text-sm text-muted-foreground">
                  Cities Covered
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-muted-foreground">
                  Average Rating
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-4xl">
              Popular Cities
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Discover amazing venues in these popular destinations
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularCities.map((city) => (
              <Card
                key={city.name}
                className="group cursor-pointer hover:shadow-lg transition-all duration-200"
              >
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MapPinIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold">{city.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {city.venues} venues
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-16 md:py-24 dark:bg-slate-900">
        <div className="container">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-4xl">
              Why Choose {APP_NAME}?
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              We make venue booking simple, transparent, and stress-free
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-200"
              >
                <CardHeader>
                  <div className="mb-2 group-hover:scale-110 transition-transform duration-200">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-4xl">
              What Our Customers Say
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Real reviews from real customers who found their perfect venues
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm mb-4 italic">"{testimonial.comment}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.event} • {testimonial.location}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section for Venue Owners */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <BuildingIcon className="h-16 w-16 mb-4" />
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-4xl">
              Own a Venue? Join Our Platform
            </h2>
            <p className="max-w-[85%] leading-normal opacity-90 sm:text-lg sm:leading-7">
              Reach thousands of customers, manage bookings efficiently, and
              grow your business with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button asChild size="lg" variant="secondary">
                <Link href="/become-partner">
                  <TrendingUpIcon className="mr-2 h-4 w-4" />
                  List Your Venue
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link
                  href="/partner-benefits"
                  className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-4xl">
              Ready to Find Your Perfect Venue?
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Join thousands of satisfied customers who have found and booked
              their dream venues through our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button asChild size="lg">
                <Link href="/marketplace">
                  <SearchIcon className="mr-2 h-4 w-4" />
                  Browse Venues
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">{APP_NAME}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Pakistan's leading event venue booking platform. Find, compare,
                and book the perfect venue for your special occasions.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">For Customers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/marketplace" className="hover:text-foreground">
                    Browse Venues
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-foreground">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-foreground">
                    Customer Support
                  </Link>
                </li>
                <li>
                  <Link href="/reviews" className="hover:text-foreground">
                    Reviews & Ratings
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">For Venue Owners</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/become-partner"
                    className="hover:text-foreground"
                  >
                    List Your Venue
                  </Link>
                </li>
                <li>
                  <Link
                    href="/partner-benefits"
                    className="hover:text-foreground"
                  >
                    Partner Benefits
                  </Link>
                </li>
                <li>
                  <Link
                    href="/partner-resources"
                    className="hover:text-foreground"
                  >
                    Resources
                  </Link>
                </li>
                <li>
                  <Link
                    href="/partner-support"
                    className="hover:text-foreground"
                  >
                    Partner Support
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 {COMPANY_NAME}. All rights reserved.</p>
            <p className="mt-2">
              Made with ❤️ for seamless event planning across Pakistan
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
