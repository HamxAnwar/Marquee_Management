"use client";

import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ChefHat,
  Package,
  DollarSign,
  Star,
} from 'lucide-react';
import { MenuCategory, MenuItem } from '@/types';

// Mock data
const mockCategories: MenuCategory[] = [
  {
    id: 1,
    name: "Appetizers",
    description: "Delicious starters and appetizers",
    display_order: 1,
    is_active: true,
    items_count: 1,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "Main Course",
    description: "Traditional and contemporary main dishes",
    display_order: 2,
    is_active: true,
    items_count: 2,
    created_at: "2024-01-15T10:05:00Z",
  },
  {
    id: 3,
    name: "Desserts",
    description: "Sweet treats and desserts",
    display_order: 3,
    is_active: true,
    items_count: 1,
    created_at: "2024-01-15T10:10:00Z",
  },
  {
    id: 4,
    name: "Beverages",
    description: "Refreshing drinks and beverages",
    display_order: 4,
    is_active: false,
    items_count: 0,
    created_at: "2024-01-15T10:15:00Z",
  },
];

const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Vegetable Samosa",
    description: "Crispy pastry filled with spiced vegetables",
    category: 1,
    category_name: "Appetizers",
    base_price: "150.00",
    serving_type: "per_piece",
    serving_type_display: "Per Piece",
    is_vegetarian: true,
    is_available: true,
    ingredients: "Potatoes, peas, spices, flour",
    preparation_time: 15,
    display_order: 1,
    variants: [],
    created_at: "2024-01-15T10:15:00Z",
    updated_at: "2024-01-15T10:15:00Z",
  },
  {
    id: 2,
    name: "Chicken Biryani",
    description: "Aromatic basmati rice with spiced chicken",
    category: 2,
    category_name: "Main Course",
    base_price: "450.00",
    serving_type: "per_plate",
    serving_type_display: "Per Plate",
    is_vegetarian: false,
    is_available: true,
    ingredients: "Basmati rice, chicken, spices, onions",
    preparation_time: 45,
    display_order: 2,
    variants: [],
    created_at: "2024-01-15T10:15:00Z",
    updated_at: "2024-01-15T10:15:00Z",
  },
  {
    id: 3,
    name: "Gulab Jamun",
    description: "Sweet milk solids dumpling in sugar syrup",
    category: 3,
    category_name: "Desserts",
    base_price: "120.00",
    serving_type: "per_piece",
    serving_type_display: "Per Piece",
    is_vegetarian: true,
    is_available: true,
    ingredients: "Milk solids, sugar, cardamom",
    preparation_time: 30,
    display_order: 3,
    variants: [],
    created_at: "2024-01-15T10:15:00Z",
    updated_at: "2024-01-15T10:15:00Z",
  },
  {
    id: 4,
    name: "Mutton Curry",
    description: "Tender mutton in rich spiced gravy",
    category: 2,
    category_name: "Main Course",
    base_price: "550.00",
    serving_type: "per_plate",
    serving_type_display: "Per Plate",
    is_vegetarian: false,
    is_available: false,
    ingredients: "Mutton, onions, tomatoes, spices",
    preparation_time: 60,
    display_order: 4,
    variants: [],
    created_at: "2024-01-15T10:15:00Z",
    updated_at: "2024-01-15T10:15:00Z",
  },
];

export default function MenuPage() {
  const [categories, setCategories] = React.useState<MenuCategory[]>(mockCategories);
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>(mockMenuItems);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = React.useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = React.useState(false);

  const categoryColumns: ColumnDef<MenuCategory>[] = [
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div>
            <div className="font-medium">{category.name}</div>
            <div className="text-sm text-gray-500">ID: {category.id}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-xs truncate" title={description}>
            {description}
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active");
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "items_count",
      header: "Items",
      cell: ({ row }) => {
        const category = row.original;
        const itemCount = menuItems.filter(item => item.category === category.id).length;
        return (
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-gray-500" />
            <span>{itemCount} items</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Items
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const itemColumns: ColumnDef<MenuItem>[] = [
    {
      accessorKey: "name",
      header: "Item Name",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div>
            <div className="font-medium flex items-center space-x-2">
              <span>{item.name}</span>
              {item.is_vegetarian && <span className="text-green-600">🌱</span>}
            </div>
            <div className="text-sm text-gray-500">{item.category_name}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-sm truncate" title={description}>
            {description}
          </div>
        );
      },
    },
    {
      accessorKey: "base_price",
      header: "Price",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("base_price"));
        return (
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="font-medium">PKR {price.toLocaleString()}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "is_available",
      header: "Availability",
      cell: ({ row }) => {
        const isAvailable = row.getValue("is_available");
        return (
          <Badge variant={isAvailable ? "default" : "destructive"}>
            {isAvailable ? "Available" : "Unavailable"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Item
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-2">Manage your menu categories and food items</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Total categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Total items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Items</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {menuItems.filter(item => item.is_available).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">
               PKR {Math.round(menuItems.reduce((sum, item) => sum + parseFloat(item.base_price), 0) / menuItems.length).toLocaleString()}
             </div>
            <p className="text-xs text-muted-foreground">
              Average item price
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Categories and Items */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Menu Categories</CardTitle>
                <CardDescription>
                  Organize your menu items into categories
                </CardDescription>
              </div>
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>
                      Create a new menu category to organize your items.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cat-name" className="text-right">Name</Label>
                      <Input id="cat-name" placeholder="Category name" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cat-desc" className="text-right">Description</Label>
                      <Textarea id="cat-desc" placeholder="Category description" className="col-span-3" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => setIsCategoryDialogOpen(false)}>Create Category</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={categoryColumns} 
                data={categories}
                searchKey="name"
                searchPlaceholder="Search categories..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>
                  Manage your food items, pricing, and availability
                </CardDescription>
              </div>
              <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Menu Item</DialogTitle>
                    <DialogDescription>
                      Add a new item to your menu with pricing and details.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="item-name" className="text-right">Name</Label>
                      <Input id="item-name" placeholder="Item name" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="item-price" className="text-right">Price</Label>
                       <Input id="item-price" type="number" placeholder="Price in PKR" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="item-desc" className="text-right">Description</Label>
                      <Textarea id="item-desc" placeholder="Item description" className="col-span-3" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => setIsItemDialogOpen(false)}>Create Item</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={itemColumns} 
                data={menuItems}
                searchKey="name"
                searchPlaceholder="Search menu items..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}