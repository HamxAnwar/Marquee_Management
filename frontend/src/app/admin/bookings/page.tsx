"use client";

import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { BookingListItem, Booking } from '@/types';
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
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useBookings, useConfirmBooking, useCancelBooking } from '@/hooks/use-bookings';
import { useCurrentUser } from '@/hooks/use-auth';



const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
    case 'completed':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Completed</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      wedding: 'bg-pink-100 text-pink-800',
      birthday: 'bg-purple-100 text-purple-800',
      corporate: 'bg-blue-100 text-blue-800',
      anniversary: 'bg-green-100 text-green-800',
      graduation: 'bg-blue-100 text-blue-800',
      religious: 'bg-purple-100 text-purple-800',
      conference: 'bg-gray-100 text-gray-800',
      workshop: 'bg-gray-100 text-gray-800',
      exhibition: 'bg-gray-100 text-gray-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[eventType] || colors.other;
  };

export default function BookingsPage() {
  const { data: user } = useCurrentUser();
  const userOrganization = user?.owned_organizations?.[0];

  const { data: bookingsData, isLoading, error } = useBookings(
    userOrganization ? { organization: userOrganization.id } : undefined
  );
  const [selectedBooking, setSelectedBooking] = React.useState<BookingListItem | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false);

  const confirmBookingMutation = useConfirmBooking(
    userOrganization ? { organization: userOrganization.id } : undefined
  );
  const cancelBookingMutation = useCancelBooking(
    userOrganization ? { organization: userOrganization.id } : undefined
  );

  const bookings = React.useMemo(() => bookingsData?.results || [], [bookingsData]);

  const handleConfirmBooking = async (bookingId: number) => {
    try {
      await confirmBookingMutation.mutateAsync(bookingId);
      setIsDetailsDialogOpen(false);
    } catch (error) {
      console.error('Failed to confirm booking:', error);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason) {
      try {
        await cancelBookingMutation.mutateAsync({ id: bookingId, reason });
        setIsDetailsDialogOpen(false);
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
  };

  const columns: ColumnDef<BookingListItem>[] = [
    {
      accessorKey: "customer_name",
      header: "Customer",
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <div>
            <div className="font-medium">{booking.customer_name}</div>
            <div className="text-sm text-gray-500 flex items-center mt-1">
              <Phone className="h-3 w-3 mr-1" />
              {booking.customer_phone}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "event_date",
      header: "Event Date & Time",
      cell: ({ row }) => {
        const booking = row.original;
        const eventDate = new Date(`${booking.event_date}T${booking.event_time || '00:00:00'}`);
        return (
          <div>
            <div className="flex items-center font-medium">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              {format(eventDate, 'MMM dd, yyyy')}
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {format(eventDate, 'hh:mm a')}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "hall_name",
      header: "Venue & Event",
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <div>
            <div className="font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              {booking.hall_name}
            </div>
            <div className="mt-1">
              <Badge className={`text-xs ${getEventTypeColor(booking.event_type)}`}>
                {booking.event_type.charAt(0).toUpperCase() + booking.event_type.slice(1)}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "guest_count",
      header: "Guests",
      cell: ({ row }) => {
        const guestCount = row.getValue("guest_count") as number;
        return (
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-gray-500" />
            <span className="font-medium">{guestCount}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "total_amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total_amount"));
        return (
          <div className="flex items-center font-medium">
            <span className="text-gray-500 mr-1">PKR</span>
            {amount.toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return getStatusBadge(status);
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedBooking(booking);
                  setIsDetailsDialogOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Booking
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel Booking
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const stats = React.useMemo(() => {
    if (!bookings) return {
      totalBookings: 0,
      confirmedBookings: 0,
      pendingBookings: 0,
      totalRevenue: 0,
    };

    return {
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter((b: BookingListItem) => b.status === 'confirmed').length,
      pendingBookings: bookings.filter((b: BookingListItem) => b.status === 'pending').length,
      totalRevenue: bookings
        .filter((b: BookingListItem) => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum: number, b: BookingListItem) => sum + parseFloat(b.total_amount || '0'), 0),
    };
  }, [bookings]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-2">Track and manage all venue bookings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">Confirmed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">PKR {stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Confirmed + completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            Manage venue bookings, customer information, and event details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading bookings...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Error loading bookings: {error.message}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={bookings}
              searchKey="customer_name"
              searchPlaceholder="Search by customer name..."
            />
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              View and manage booking information
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="grid gap-6 py-4">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="font-medium">{selectedBooking.customer_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedBooking.customer_phone}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedBooking.customer_email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Event Details</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-sm font-medium text-gray-500">Event Type</label>
                     <p>
                       <Badge className={`${getEventTypeColor(selectedBooking.event_type)}`}>
                         {selectedBooking.event_type_display}
                       </Badge>
                     </p>
                   </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p>{getStatusBadge(selectedBooking.status)}</p>
                  </div>
                   <div>
                     <label className="text-sm font-medium text-gray-500">Date & Time</label>
                     <p className="font-medium">
                       {format(new Date(`${selectedBooking.event_date}T${selectedBooking.event_time || '00:00:00'}`), 'PPP p')}
                     </p>
                   </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Guest Count</label>
                    <p className="flex items-center font-medium">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedBooking.guest_count} guests
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Venue</label>
                    <p className="flex items-center font-medium">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedBooking.hall_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Pricing</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount</span>
                     <span className="text-2xl font-bold text-green-600">
                       PKR {parseFloat(selectedBooking.total_amount).toLocaleString()}
                     </span>
                  </div>
                </div>
              </div>

               {/* Actions */}
               <div className="flex justify-end space-x-2 pt-4 border-t">
                 <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                   Close
                 </Button>
                 {selectedBooking.status === 'pending' && (
                   <>
                     <Button
                       variant="destructive"
                       onClick={() => handleCancelBooking(selectedBooking.id)}
                       disabled={cancelBookingMutation.isPending}
                     >
                       <XCircle className="mr-2 h-4 w-4" />
                       {cancelBookingMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
                     </Button>
                     <Button
                       onClick={() => handleConfirmBooking(selectedBooking.id)}
                       disabled={confirmBookingMutation.isPending}
                     >
                       <CheckCircle className="mr-2 h-4 w-4" />
                       {confirmBookingMutation.isPending ? 'Confirming...' : 'Confirm Booking'}
                     </Button>
                   </>
                 )}
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}