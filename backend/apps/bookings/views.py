from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import Booking, BookingMenuItem, BookingStatusHistory
from .serializers import (
    BookingSerializer, BookingListSerializer, BookingDetailSerializer,
    BookingCreateSerializer, BookingUpdateSerializer, BookingMenuItemSerializer,
    BookingStatusHistorySerializer
)


class BookingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing bookings"""
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BookingListSerializer
        elif self.action == 'retrieve':
            return BookingDetailSerializer
        elif self.action == 'create':
            return BookingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BookingUpdateSerializer
        return BookingSerializer
    
    def get_queryset(self):
        queryset = Booking.objects.select_related('customer', 'hall').prefetch_related('menu_items')
        
        # Users can only see their own bookings, staff can see all
        if not self.request.user.is_staff:
            queryset = queryset.filter(customer=self.request.user)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by hall
        hall = self.request.query_params.get('hall')
        if hall:
            queryset = queryset.filter(hall_id=hall)
        
        # Filter by event type
        event_type = self.request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(event_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(event_date__lte=end_date)
        
        # Filter upcoming/past bookings
        time_filter = self.request.query_params.get('time_filter')
        if time_filter == 'upcoming':
            queryset = queryset.filter(event_date__gte=timezone.now().date())
        elif time_filter == 'past':
            queryset = queryset.filter(event_date__lt=timezone.now().date())
        
        # Search by booking ID or customer name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(booking_id__icontains=search) | 
                Q(customer__first_name__icontains=search) | 
                Q(customer__last_name__icontains=search) |
                Q(customer__username__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        """Get current user's bookings"""
        bookings = self.get_queryset().filter(customer=request.user)
        serializer = BookingListSerializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming bookings"""
        bookings = self.get_queryset().filter(
            event_date__gte=timezone.now().date()
        )
        serializer = BookingListSerializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending bookings (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Staff access required'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        bookings = self.get_queryset().filter(status='pending')
        serializer = BookingListSerializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a booking (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Staff access required'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking = self.get_object()
        if booking.status != 'pending':
            return Response(
                {'error': f'Cannot confirm booking with status: {booking.status}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = booking.status
        booking.status = 'confirmed'
        booking.confirmed_at = timezone.now()
        booking.save()
        
        # Create status history
        BookingStatusHistory.objects.create(
            booking=booking,
            old_status=old_status,
            new_status='confirmed',
            changed_by=request.user,
            reason='Confirmed via API'
        )
        
        serializer = BookingDetailSerializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        # Check permissions
        if not request.user.is_staff and booking.customer != request.user:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status in ['cancelled', 'completed']:
            return Response(
                {'error': f'Cannot cancel booking with status: {booking.status}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reason = request.data.get('reason', 'Cancelled via API')
        old_status = booking.status
        booking.status = 'cancelled'
        booking.save()
        
        # Create status history
        BookingStatusHistory.objects.create(
            booking=booking,
            old_status=old_status,
            new_status='cancelled',
            changed_by=request.user,
            reason=reason
        )
        
        serializer = BookingDetailSerializer(booking)
        return Response(serializer.data)
