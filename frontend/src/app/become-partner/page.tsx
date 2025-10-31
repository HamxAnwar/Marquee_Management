"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircleIcon,
  TrendingUpIcon,
  UsersIcon,
  DollarSignIcon,
  CalendarIcon,
  BarChartIcon,
  ShieldCheckIcon,
  HeadphonesIcon,
  StarIcon,
  BuildingIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  GlobeIcon,
  FileTextIcon,
  CameraIcon,
} from "lucide-react";
import { APP_NAME, COMPANY_NAME } from "@/constants";

export default function BecomePartnerPage() {
  const [formData, setFormData] = useState({
    organizationName: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    businessLicense: "",
    taxId: "",
    description: "",
    termsAccepted: false,
    marketingEmails: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const benefits = [
    {
      icon: <TrendingUpIcon className="h-8 w-8 text-primary" />,
      title: "Increase Revenue",
      description: "Reach thousands of potential customers and increase your booking rate by up to 300%",
    },
    {
      icon: <UsersIcon className="h-8 w-8 text-primary" />,
      title: "Wider Reach",
      description: "Connect with customers across Pakistan who are actively looking for venues",
    },
    {
      icon: <CalendarIcon className="h-8 w-8 text-primary" />,
      title: "Easy Management",
      description: "Manage bookings, schedules, and customer communications from one dashboard",
    },
    {
      icon: <BarChartIcon className="h-8 w-8 text-primary" />,
      title: "Analytics & Insights",
      description: "Get detailed analytics about your performance, popular times, and customer preferences",
    },
    {
      icon: <DollarSignIcon className="h-8 w-8 text-primary" />,
      title: "Competitive Commission",
      description: "Industry-leading low commission rates with transparent pricing - no hidden fees",
    },
    {
      icon: <HeadphonesIcon className="h-8 w-8 text-primary" />,
      title: "Dedicated Support",
      description: "24/7 partner support team to help you maximize your success on our platform",
    },
  ];

  const steps = [
    "Basic Information",
    "Business Details",
    "Review & Submit"
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    // Show success message or redirect
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.organizationName && formData.email && formData.phone;
      case 2:
        return formData.address && formData.city && formData.state;
      case 3:
        return formData.termsAccepted;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">{APP_NAME}</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/marketplace">Browse Venues</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="mb-4">
              Join 500+ Partner Venues
            </Badge>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Grow Your Venue Business with{" "}
              <span className="text-primary">{APP_NAME}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join Pakistan's leading event venue platform and connect with thousands of
              customers looking for the perfect venue for their special occasions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span>Low commission rates</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span>Instant payouts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Why Partner with Us?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join hundreds of successful venue partners who have grown their business with our platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4">{benefit.icon}</div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Start Your Partnership Journey
              </h2>
              <p className="text-lg text-muted-foreground">
                Fill out this form to join our platform and start receiving bookings
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center flex-1">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index + 1 <= currentStep
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="ml-2 text-sm font-medium hidden sm:block">
                        {step}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-px mx-4 ${
                          index + 1 < currentStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-6">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="organizationName">Organization Name *</Label>
                          <Input
                            id="organizationName"
                            value={formData.organizationName}
                            onChange={(e) => handleInputChange("organizationName", e.target.value)}
                            placeholder="e.g. Royal Gardens Events"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="contact@yourvenue.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="+92-300-1234567"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website (Optional)</Label>
                          <Input
                            id="website"
                            type="url"
                            value={formData.website}
                            onChange={(e) => handleInputChange("website", e.target.value)}
                            placeholder="https://yourvenue.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Business Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Business Details</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="address">Business Address *</Label>
                          <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            placeholder="Complete business address"
                            required
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="city">City *</Label>
                            <Select
                              value={formData.city}
                              onValueChange={(value) => handleInputChange("city", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select city" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="karachi">Karachi</SelectItem>
                                <SelectItem value="lahore">Lahore</SelectItem>
                                <SelectItem value="islamabad">Islamabad</SelectItem>
                                <SelectItem value="quetta">Quetta</SelectItem>
                                <SelectItem value="peshawar">Peshawar</SelectItem>
                                <SelectItem value="multan">Multan</SelectItem>
                                <SelectItem value="faisalabad">Faisalabad</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="state">Province/State *</Label>
                            <Select
                              value={formData.state}
                              onValueChange={(value) => handleInputChange("state", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select province" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sindh">Sindh</SelectItem>
                                <SelectItem value="punjab">Punjab</SelectItem>
                                <SelectItem value="kpk">Khyber Pakhtunkhwa</SelectItem>
                                <SelectItem value="balochistan">Balochistan</SelectItem>
                                <SelectItem value="gilgit-baltistan">Gilgit-Baltistan</SelectItem>
                                <SelectItem value="azad-kashmir">Azad Kashmir</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input
                              id="postalCode"
                              value={formData.postalCode}
                              onChange={(e) => handleInputChange("postalCode", e.target.value)}
                              placeholder="75600"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="businessLicense">Business License/Registration</Label>
                            <Input
                              id="businessLicense"
                              value={formData.businessLicense}
                              onChange={(e) => handleInputChange("businessLicense", e.target.value)}
                              placeholder="License number (if applicable)"
                            />
                          </div>
                          <div>
                            <Label htmlFor="taxId">Tax ID/NTN</Label>
                            <Input
                              id="taxId"
                              value={formData.taxId}
                              onChange={(e) => handleInputChange("taxId", e.target.value)}
                              placeholder="Tax identification number"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Organization Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Tell us about your venue(s) and what makes them special..."
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Review & Submit */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Review Your Information</h3>
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Organization:</strong> {formData.organizationName}
                            </div>
                            <div>
                              <strong>Email:</strong> {formData.email}
                            </div>
                            <div>
                              <strong>Phone:</strong> {formData.phone}
                            </div>
                            <div>
                              <strong>Website:</strong> {formData.website || "Not provided"}
                            </div>
                            <div className="md:col-span-2">
                              <strong>Address:</strong> {formData.address}, {formData.city}, {formData.state}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={formData.termsAccepted}
                          onCheckedChange={(checked) => handleInputChange("termsAccepted", checked as boolean)}
                        />
                        <Label htmlFor="terms" className="text-sm">
                          I agree to the{" "}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="marketing"
                          checked={formData.marketingEmails}
                          onCheckedChange={(checked) => handleInputChange("marketingEmails", checked as boolean)}
                        />
                        <Label htmlFor="marketing" className="text-sm">
                          I would like to receive marketing emails and partner updates
                        </Label>
                      </div>
                    </div>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-900 mb-1">What happens next?</p>
                            <ul className="text-blue-800 space-y-1">
                              <li>• Your application will be reviewed within 24-48 hours</li>
                              <li>• You'll receive an email confirmation once approved</li>
                              <li>• Our partner success team will contact you for onboarding</li>
                              <li>• You can start listing your venues and receiving bookings</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={!isStepValid(currentStep)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!isStepValid(currentStep)}
                      className="min-w-32"
                    >
                      Submit Application
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How much does it cost to join?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Joining our platform is completely free! We only charge a small commission on successful bookings,
                  which means you only pay when you earn.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What commission do you charge?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our commission rates are competitive and transparent, starting from just 5% of the booking value.
                  There are no hidden fees or setup costs.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How quickly will I get approved?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Most applications are reviewed and approved within 24-48 hours. Our team will contact you
                  directly once your application is processed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container py-12">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 {COMPANY_NAME}. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Questions? Contact us at{" "}
              <Link href="mailto:partners@marqueebooking.com" className="text-primary hover:underline">
                partners@marqueebooking.com
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
