from rest_framework import viewsets, status, permissions
import stripe
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.utils import timezone
from django.conf import settings
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

    def get_permissions(self):
        """
        Allow unauthenticated access for booking creation (guest bookings),
        but require authentication for other operations
        """
        if self.action == 'create':
            return []  # Allow anyone to create bookings
        return [permissions.IsAuthenticated()]
    
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
        queryset = Booking.objects.select_related('customer', 'hall', 'organization').prefetch_related('menu_items')

        user = self.request.user

        # Platform staff can see all bookings
        if user.is_staff:
            pass  # No filtering needed
        else:
            # Check if user is platform admin
            is_platform_admin = False
            try:
                if hasattr(user, 'userprofile') and user.userprofile.is_platform_admin:
                    is_platform_admin = True
            except:
                pass

            if is_platform_admin:
                pass  # No filtering needed
            else:
                # Build filter for accessible bookings
                accessible_filters = Q(customer=user)  # User's own bookings

                # Check if user owns any organizations
                from apps.core.models import Organization
                owned_organizations = Organization.objects.filter(owner=user)
                if owned_organizations.exists():
                    accessible_filters |= Q(organization__in=owned_organizations)

                # Check if user is a member of any organizations
                from apps.core.models import OrganizationMember
                member_organizations = OrganizationMember.objects.filter(
                    user=user,
                    is_active=True,
                    role__in=['admin', 'manager', 'staff']
                ).values_list('organization', flat=True)

                if member_organizations:
                    accessible_filters |= Q(organization__in=member_organizations)

                queryset = queryset.filter(accessible_filters)

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by hall
        hall = self.request.query_params.get('hall')
        if hall:
            queryset = queryset.filter(hall_id=hall)

        # Filter by organization (for organization-specific views)
        organization = self.request.query_params.get('organization')
        if organization:
            queryset = queryset.filter(organization_id=organization)

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
        """Confirm a booking (staff or venue owner only)"""
        booking = self.get_object()

        # Check if user is staff or owns the organization
        is_staff = request.user.is_staff
        is_venue_owner = False
        try:
            from apps.core.models import Organization
            is_venue_owner = Organization.objects.filter(
                owner=request.user,
                id=booking.organization.id
            ).exists()
        except:
            pass

        if not (is_staff or is_venue_owner):
            return Response(
                {'error': 'Staff or venue owner access required'},
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

        # Check permissions: staff, customer, or venue owner
        is_staff = request.user.is_staff
        is_customer = booking.customer == request.user
        is_venue_owner = False
        try:
            from apps.core.models import Organization
            is_venue_owner = Organization.objects.filter(
                owner=request.user,
                id=booking.organization.id
            ).exists()
        except:
            pass

        if not (is_staff or is_customer or is_venue_owner):
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

    @action(detail=True, methods=['post'])
    def create_payment_intent(self, request, pk=None):
        """Create Stripe payment intent for booking"""
        booking = self.get_object()

        # Check if user can pay for this booking
        if not request.user.is_staff and booking.customer != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        if booking.status != 'confirmed':
            return Response(
                {'error': 'Booking must be confirmed before payment'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            stripe.api_key = settings.STRIPE_SECRET_KEY

            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=int(booking.balance_due * 100),  # Convert to cents
                currency='usd',  # Or 'pkr' for Pakistani Rupee
                metadata={
                    'booking_id': booking.id,
                    'booking_code': booking.booking_id
                }
            )

            return Response({
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )




class StripeWebhookView(APIView):
    """Handle Stripe webhooks"""
    permission_classes = []  # No authentication for webhooks

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            stripe.api_key = settings.STRIPE_SECRET_KEY
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )

        except ValueError as e:
            return Response({'error': 'Invalid payload'}, status=400)
        except stripe.error.SignatureVerificationError as e:
            return Response({'error': 'Invalid signature'}, status=400)

        # Handle the event
        if event.type == 'payment_intent.succeeded':
            payment_intent = event.data.object
            booking_id = payment_intent.metadata.get('booking_id')

            if booking_id:
                try:
                    booking = Booking.objects.get(id=booking_id)
                    booking.payment_status = 'paid'
                    booking.save()

                    # Create payment record
                    from .models import BookingPayment
                    payment = BookingPayment.objects.create(
                        booking=booking,
                        amount=booking.balance_due,
                        payment_method='stripe',
                        payment_type='full',
                        transaction_id=payment_intent.id,
                        status='completed'
                    )

                    # Calculate commission
                    commission_amount = (booking.balance_due * booking.organization.commission_rate) / 100
                    payment.commission_amount = commission_amount
                    payment.save()
                except Booking.DoesNotExist:
                    pass

        return Response({'status': 'success'})
