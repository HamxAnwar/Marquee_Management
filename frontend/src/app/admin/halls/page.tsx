"use client";

import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
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
import { 
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Users
} from 'lucide-react';
import { HallListItem } from '@/types';
import { useHalls, useCreateHall, useToggleHallStatus } from '@/hooks/use-halls';
import { CreateHallRequest } from '@/services/halls';
import { Loader2 } from 'lucide-react';

export default function HallsPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  // API hooks
  const { data: hallsResponse, isLoading: hallsLoading, error: hallsError } = useHalls();
  const createHallMutation = useCreateHall();
  const toggleStatusMutation = useToggleHallStatus();
  
  const halls = hallsResponse?.results || [];

  // Handle form submission
  const handleCreateHall = async (formData: FormData) => {
    const hallData: CreateHallRequest = {
      name: formData.get('name') as string,
      capacity: parseInt(formData.get('capacity') as string),
      base_price: formData.get('price') as string,
      description: formData.get('description') as string,
      is_active: true,
    };
    
    try {
      await createHallMutation.mutateAsync(hallData);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create hall:', error);
    }
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  // Show loading state
  if (hallsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading halls...</span>
      </div>
    );
  }

  // Show error state
  if (hallsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load halls</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const columns: ColumnDef<HallListItem>[] = [
    {
      accessorKey: "name",
      header: "Hall Name",
      cell: ({ row }) => {
        const hall = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div>
              <div className="font-medium">{hall.name}</div>
              <div className="text-sm text-gray-500">ID: {hall.id}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{row.getValue("capacity")} guests</span>
          </div>
        );
      },
    },
    {
      accessorKey: "base_price",
      header: "Base Price",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("base_price"));
        return <div className="font-medium">₹{price.toLocaleString()}</div>;
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
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const hall = row.original;
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
                Edit Hall
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
          <h1 className="text-3xl font-bold text-gray-900">Halls Management</h1>
          <p className="text-gray-600 mt-2">Manage your venue halls and their pricing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Hall
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Hall</DialogTitle>
              <DialogDescription>
                Create a new hall for your venue. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateHall} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" placeholder="Hall name" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">
                  Capacity
                </Label>
                <Input id="capacity" name="capacity" type="number" placeholder="Maximum guests" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Base Price
                </Label>
                <Input id="price" name="price" type="number" placeholder="Base price in ₹" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input id="description" name="description" placeholder="Hall description" className="col-span-3" />
              </div>
              <div className="flex justify-end space-x-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={createHallMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createHallMutation.isPending}
              >
                {createHallMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Hall'
                )}
              </Button>
            </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Halls</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{halls.length}</div>
            <p className="text-xs text-muted-foreground">
              Venues available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Halls</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {halls.filter(h => h.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {halls.reduce((sum, hall) => sum + hall.capacity, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum guests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{Math.round(halls.reduce((sum, hall) => sum + parseFloat(hall.base_price), 0) / halls.length).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Average base price
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Halls Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Halls</CardTitle>
          <CardDescription>
            Manage your venue halls, pricing, and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={halls}
            searchKey="name"
            searchPlaceholder="Search halls..."
          />
        </CardContent>
      </Card>
    </div>
  );
}