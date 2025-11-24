from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal
from .models import Booking, BookingMenuItem, BookingStatusHistory
from apps.core.serializers import HallListSerializer, UserSerializer
from apps.menu.serializers import MenuItemListSerializer, MenuItemVariantSerializer


class BookingMenuItemSerializer(serializers.ModelSerializer):
    """Serializer for BookingMenuItem model"""
    menu_item = MenuItemListSerializer(read_only=True)
    menu_item_id = serializers.IntegerField(write_only=True)
    variant = MenuItemVariantSerializer(read_only=True)
    variant_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = BookingMenuItem
        fields = ['id', 'menu_item', 'menu_item_id', 'variant', 'variant_id', 
                 'quantity', 'unit_price', 'total_price', 'notes']
        read_only_fields = ['id', 'total_price']
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value
    
    def validate_unit_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Unit price cannot be negative.")
        return value


class BookingStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer for BookingStatusHistory model"""
    changed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = BookingStatusHistory
        fields = ['id', 'old_status', 'new_status', 'changed_by', 'reason', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class BookingListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing bookings"""
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.CharField(source='contact_phone', read_only=True)
    customer_email = serializers.CharField(source='contact_email', read_only=True)
    hall_name = serializers.CharField(source='hall.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    is_upcoming = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()

    def get_customer_name(self, obj):
        if obj.customer:
            return obj.customer.get_full_name()
        return obj.contact_person_name or "Guest User"

    class Meta:
        model = Booking
        fields = ['id', 'booking_id', 'customer_name', 'customer_phone', 'customer_email', 'hall_name', 'event_date',
                  'event_time', 'event_type', 'event_type_display', 'guest_count', 'total_amount',
                  'status', 'status_display', 'is_upcoming', 'is_past', 'created_at']


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Booking model"""
    customer = UserSerializer(read_only=True)
    customer_id = serializers.IntegerField(write_only=True)
    hall = HallListSerializer(read_only=True)
    hall_id = serializers.IntegerField(write_only=True)
    menu_items = BookingMenuItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    is_upcoming = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    
    class Meta:
        model = Booking
        fields = ['booking_id', 'customer', 'customer_id', 'hall', 'hall_id',
                  'event_date', 'event_time', 'event_type', 'event_type_display',
                  'guest_count', 'contact_phone', 'contact_email',
                  'special_requirements', 'subtotal', 'discount_amount',
                  'tax_amount', 'total_amount', 'status', 'status_display',
                  'menu_items', 'is_upcoming', 'is_past', 'customer_notes',
                  'created_at', 'updated_at', 'confirmed_at']
        read_only_fields = ['booking_id', 'created_at', 'updated_at', 'confirmed_at']
    
    def validate_event_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Event date cannot be in the past.")
        return value
    
    def validate_guest_count(self, value):
        if value <= 0:
            raise serializers.ValidationError("Guest count must be greater than zero.")
        return value
    
    def validate_contact_phone(self, value):
        if not value.strip():
            raise serializers.ValidationError("Contact phone is required.")
        return value
    
    def validate_contact_email(self, value):
        if not value.strip():
            raise serializers.ValidationError("Contact email is required.")
        return value

    def validate(self, data):
        # Validate hall belongs to organization
        if data.get('hall') and data.get('organization'):
            if data['hall'].organization_id != data['organization']:
                raise serializers.ValidationError("Selected hall does not belong to the specified organization.")

        # Validate capacity
        if data.get('hall') and data.get('guest_count'):
            if data['guest_count'] > data['hall'].capacity:
                raise serializers.ValidationError(f"Guest count ({data['guest_count']}) exceeds hall capacity ({data['hall'].capacity}).")

        # Validate package guest range
        if data.get('selected_package_id'):
            from apps.menu.models import MenuPackage
            try:
                package = MenuPackage.objects.get(id=data['selected_package_id'], organization_id=data.get('organization'))
                guest_count = data.get('guest_count', 0)
                if guest_count < package.min_guests or (package.max_guests and guest_count > package.max_guests):
                    raise serializers.ValidationError(f"Guest count ({guest_count}) doesn't match package range ({package.min_guests}-{package.max_guests or 'unlimited'}).")
            except MenuPackage.DoesNotExist:
                raise serializers.ValidationError("Selected package not found.")

        return data


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings with menu items"""
    menu_items_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        help_text="List of menu item objects with menu_item_id, variant_id, quantity, unit_price"
    )
    selected_package_id = serializers.IntegerField(write_only=True, required=False, allow_null=True,
        help_text="ID of selected menu package (alternative to menu_items_data)")
    is_guest_booking = serializers.BooleanField(default=False, write_only=True,
        help_text="Whether this is a guest booking (no user account required)")

    class Meta:
        model = Booking
        fields = ['organization', 'hall', 'event_date', 'event_time', 'event_type', 'guest_count',
                  'contact_phone', 'contact_email', 'contact_person_name', 'special_requirements',
                  'menu_items_data', 'selected_package_id', 'is_guest_booking']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make hall optional for initial booking requests
        self.fields['hall'].required = False
        self.fields['hall'].allow_null = True
        # Add organization field
        if 'organization' not in self.fields:
            self.fields['organization'] = serializers.IntegerField()
    
    def validate_event_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Event date cannot be in the past.")
        return value
    
    def validate_guest_count(self, value):
        if value <= 0:
            raise serializers.ValidationError("Guest count must be greater than zero.")
        return value
    
    def create(self, validated_data):
        menu_items_data = validated_data.pop('menu_items_data', [])
        selected_package_id = validated_data.pop('selected_package_id', None)
        is_guest_booking = validated_data.pop('is_guest_booking', False)

        # Set customer based on booking type
        if is_guest_booking:
            # For guest bookings, don't set a customer (leave as null)
            validated_data['customer'] = None
            validated_data['is_guest_booking'] = True
        else:
            # For authenticated bookings, set customer from request user
            validated_data['customer'] = self.context['request'].user
            validated_data['is_guest_booking'] = False

        # Handle selected package
        if selected_package_id:
            from apps.menu.models import MenuPackage
            try:
                package = MenuPackage.objects.get(id=selected_package_id, organization_id=validated_data['organization'])
                validated_data['selected_package'] = package
                # If package is selected, populate menu_items_data from package items
                if not menu_items_data:  # Only if no custom items provided
                    menu_items_data = []
                    for package_item in package.package_items.all():
                        menu_items_data.append({
                            'menu_item_id': package_item.menu_item.id,
                            'variant_id': package_item.variant.id if package_item.variant else None,
                            'quantity': package_item.quantity_per_person * validated_data['guest_count'],
                            'unit_price': package_item.additional_cost or package_item.menu_item.base_price,
                            'notes': f'From package: {package.name}'
                        })
            except MenuPackage.DoesNotExist:
                raise serializers.ValidationError("Selected package not found or not available for this organization.")

        # Create booking
        booking = Booking.objects.create(**validated_data)

        # Create menu items
        total_cost = Decimal('0.00')
        for item_data in menu_items_data:
            booking_item = BookingMenuItem.objects.create(
                booking=booking,
                **item_data
            )
            total_cost += booking_item.total_price

        # Update booking totals (basic calculation for now)
        booking.subtotal = total_cost
        booking.total_amount = total_cost
        booking.save()

        return booking
    
    def to_representation(self, instance):
        return BookingSerializer(instance, context=self.context).data


class BookingUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating booking status and details"""
    
    class Meta:
        model = Booking
        fields = ['event_date', 'event_time', 'event_type', 'guest_count',
                  'contact_phone', 'contact_email', 'special_requirements',
                  'status', 'customer_notes']
    
    def validate_event_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Event date cannot be in the past.")
        return value
    
    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data.get('status', old_status)
        
        # Update the booking
        booking = super().update(instance, validated_data)
        
        # Create status history if status changed
        if old_status != new_status:
            BookingStatusHistory.objects.create(
                booking=booking,
                old_status=old_status,
                new_status=new_status,
                changed_by=self.context['request'].user,
                reason=f"Status updated via API"
            )
            
            # Set confirmed_at and payment_status if status is confirmed
            if new_status == 'confirmed' and not booking.confirmed_at:
                booking.confirmed_at = timezone.now()
                booking.payment_status = 'paid'  # Simulate payment completion
                booking.save(update_fields=['confirmed_at', 'payment_status'])
        
        return booking


class BookingDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual booking view"""
    customer = UserSerializer(read_only=True)
    hall = HallListSerializer(read_only=True)
    menu_items = BookingMenuItemSerializer(many=True, read_only=True)
    status_history = BookingStatusHistorySerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    is_upcoming = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    
    class Meta:
        model = Booking
        fields = ['booking_id', 'customer', 'hall', 'event_date', 'event_time',
                  'event_type', 'event_type_display', 'guest_count',
                  'contact_phone', 'contact_email', 'special_requirements',
                  'subtotal', 'discount_amount', 'tax_amount', 'total_amount',
                  'status', 'status_display', 'menu_items', 'status_history',
                  'is_upcoming', 'is_past', 'customer_notes', 'created_at',
                  'updated_at', 'confirmed_at']