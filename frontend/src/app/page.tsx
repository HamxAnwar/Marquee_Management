import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UsersIcon, ChefHatIcon, CreditCardIcon, SparklesIcon, ClockIcon } from "lucide-react";
import { APP_NAME, COMPANY_NAME } from "@/constants";

export default function Home() {
  const features = [
    {
      icon: <CalendarIcon className="h-8 w-8 text-primary" />,
      title: "Event Planning",
      description: "Plan and book your perfect event with our user-friendly interface"
    },
    {
      icon: <ChefHatIcon className="h-8 w-8 text-primary" />,
      title: "Curated Menus",
      description: "Choose from our expertly crafted menu options or get suggestions within your budget"
    },
    {
      icon: <UsersIcon className="h-8 w-8 text-primary" />,
      title: "Flexible Capacity",
      description: "Accommodating intimate gatherings to grand celebrations with flexible pricing"
    },
    {
      icon: <CreditCardIcon className="h-8 w-8 text-primary" />,
      title: "Transparent Pricing",
      description: "Real-time pricing calculations with guest-based discounts and clear breakdowns"
    },
    {
      icon: <SparklesIcon className="h-8 w-8 text-primary" />,
      title: "Premium Venues",
      description: "Beautiful halls with modern facilities and elegant décor"
    },
    {
      icon: <ClockIcon className="h-8 w-8 text-primary" />,
      title: "Easy Booking",
      description: "Quick and hassle-free booking process with instant confirmation"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <SparklesIcon className="h-6 w-6" />
              <span className="font-bold">{APP_NAME}</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link className="transition-colors hover:text-foreground/80" href="/halls">
                Halls
              </Link>
              <Link className="transition-colors hover:text-foreground/80" href="/menu">
                Menu
              </Link>
              <Link className="transition-colors hover:text-foreground/80" href="/booking">
                Book Now
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-2">
              <Button asChild variant="ghost">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <Badge variant="outline" className="text-sm">
            Powered by {COMPANY_NAME}
          </Badge>
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Your Dream Event,
            <br className="hidden sm:inline" />
            <span className="text-primary">Perfectly Planned</span>
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Experience seamless event booking for weddings, celebrations, and corporate events.
            From venue selection to menu planning with transparent pricing and real-time availability.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" className="h-11">
              <Link href="/halls">Explore Venues</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11">
              <Link href="/menu">View Menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Everything You Need
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            From intimate gatherings to grand celebrations, we have all the tools
            and services you need to create unforgettable events.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col justify-between p-6">
              <CardHeader className="pb-4">
                <div className="mb-2">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Ready to Plan Your Event?
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Join hundreds of satisfied customers who have created memorable events with us.
            Start planning your perfect celebration today.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/booking">Start Booking</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/halls">Browse Venues</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <SparklesIcon className="h-6 w-6" />
            <p className="text-center text-sm leading-loose md:text-left">
              Built by{" "}
              <span className="font-medium underline underline-offset-4">
                {COMPANY_NAME}
              </span>
              . Experience the future of event planning.
            </p>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © 2024 {COMPANY_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}