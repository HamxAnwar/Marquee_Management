'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  SparklesIcon, 
  ChefHatIcon, 
  SearchIcon,
  FilterIcon,
  LeafIcon,
  UtensilsIcon,
  DollarSignIcon
} from 'lucide-react';
import { APP_NAME } from '@/constants';

interface MenuCategory {
  id: number;
  name: string;
  description: string;
  display_order: number;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  category: number;
  category_name?: string;
  is_vegetarian: boolean;
  is_available: boolean;
  image_url?: string;
  allergens?: string[];
  ingredients?: string[];
}

export default function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/categories/`);
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.results || categoriesData);
      }

      // Fetch menu items
      const itemsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/items/`);
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        const items = itemsData.results || itemsData;
        
        // Add category names to items
        const itemsWithCategoryNames = items.map((item: MenuItem) => {
          const category = (categoriesData.results || categoriesData).find((cat: MenuCategory) => cat.id === item.category);
          return {
            ...item,
            category_name: category?.name || 'Uncategorized'
          };
        });
        
        setMenuItems(itemsWithCategoryNames);
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
                             item.category.toString() === selectedCategory;
      
      const matchesDietary = !dietaryFilter || 
                            (dietaryFilter === 'vegetarian' && item.is_vegetarian) ||
                            (dietaryFilter === 'non-vegetarian' && !item.is_vegetarian);
      
      const matchesPrice = !priceFilter || 
                          (priceFilter === 'budget' && parseFloat(item.price) <= 15) ||
                          (priceFilter === 'mid' && parseFloat(item.price) > 15 && parseFloat(item.price) <= 30) ||
                          (priceFilter === 'premium' && parseFloat(item.price) > 30);

      return matchesSearch && matchesCategory && matchesDietary && matchesPrice && item.is_available;
    });

  const groupedItems = categories.reduce((acc, category) => {
    acc[category.id] = filteredItems.filter(item => item.category === category.id);
    return acc;
  }, {} as Record<number, MenuItem[]>);

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
              <Link href="/halls" className="text-gray-600 hover:text-gray-900">Halls</Link>
              <Link href="/menu" className="text-primary font-medium">Menu</Link>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Delicious Menu</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our carefully crafted menu options for your special event. From appetizers to desserts, we have something for everyone.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <UtensilsIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dietaryFilter} onValueChange={setDietaryFilter}>
              <SelectTrigger>
                <LeafIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Dietary" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Options</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger>
                <DollarSignIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Prices</SelectItem>
                <SelectItem value="budget">Budget (≤$15)</SelectItem>
                <SelectItem value="mid">Mid-range ($15-30)</SelectItem>
                <SelectItem value="premium">Premium (&gt;$30)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Menu Content */}
        {selectedCategory === 'all' ? (
          // Show all categories with their items
          <div className="space-y-12">
            {categories
              .sort((a, b) => a.display_order - b.display_order)
              .map((category) => {
                const categoryItems = groupedItems[category.id] || [];
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {category.name}
                      </h2>
                      <p className="text-gray-600">{category.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryItems.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg flex items-center">
                                  {item.name}
                                  {item.is_vegetarian && (
                                    <LeafIcon className="h-4 w-4 ml-2 text-green-600" />
                                  )}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  {item.description}
                                </CardDescription>
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                ${parseFloat(item.price).toFixed(2)}
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent>
                            {item.ingredients && item.ingredients.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs text-gray-500 font-medium mb-1">Ingredients:</p>
                                <div className="flex flex-wrap gap-1">
                                  {item.ingredients.slice(0, 4).map((ingredient, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {ingredient}
                                    </Badge>
                                  ))}
                                  {item.ingredients.length > 4 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{item.ingredients.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {item.allergens && item.allergens.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs text-red-600 font-medium mb-1">Allergens:</p>
                                <div className="flex flex-wrap gap-1">
                                  {item.allergens.map((allergen, index) => (
                                    <Badge key={index} variant="destructive" className="text-xs">
                                      {allergen}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {item.is_vegetarian ? (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    <LeafIcon className="h-3 w-3 mr-1" />
                                    Vegetarian
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-red-600 border-red-600">
                                    Non-Veg
                                  </Badge>
                                )}
                              </div>
                              <Button size="sm" variant="outline">
                                Add to Event
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          // Show selected category items
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {(() => {
              const category = categories.find(cat => cat.id.toString() === selectedCategory);
              const categoryItems = groupedItems[parseInt(selectedCategory)] || [];
              
              return (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {category?.name}
                    </h2>
                    <p className="text-gray-600">{category?.description}</p>
                  </div>

                  {categoryItems.length === 0 ? (
                    <div className="text-center py-12">
                      <ChefHatIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
                      <p className="text-gray-500">Try adjusting your filters or search terms</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryItems.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg flex items-center">
                                  {item.name}
                                  {item.is_vegetarian && (
                                    <LeafIcon className="h-4 w-4 ml-2 text-green-600" />
                                  )}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  {item.description}
                                </CardDescription>
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                ${parseFloat(item.price).toFixed(2)}
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {item.is_vegetarian ? (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    <LeafIcon className="h-3 w-3 mr-1" />
                                    Vegetarian
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-red-600 border-red-600">
                                    Non-Veg
                                  </Badge>
                                )}
                              </div>
                              <Button size="sm" variant="outline">
                                Add to Event
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Plan Your Menu?
          </h2>
          <p className="text-gray-600 mb-6">
            Create a customized menu for your event or get recommendations based on your budget and preferences.
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/booking">Start Planning</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/halls">Browse Venues</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}