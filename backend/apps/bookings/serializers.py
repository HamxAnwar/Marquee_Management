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
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    hall_name = serializers.CharField(source='hall.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    is_upcoming = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    
    class Meta:
        model = Booking
        fields = ['booking_id', 'customer_name', 'hall_name', 'event_date', 
                 'event_type_display', 'guest_count', 'total_amount', 
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
                 'menu_items', 'is_upcoming', 'is_past', 'notes',
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


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings with menu items"""
    menu_items_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        help_text="List of menu item objects with menu_item_id, variant_id, quantity, unit_price"
    )
    
    class Meta:
        model = Booking
        fields = ['hall', 'event_date', 'event_time', 'event_type', 'guest_count',
                 'contact_phone', 'contact_email', 'special_requirements', 
                 'menu_items_data']
    
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
        
        # Set customer from request user
        validated_data['customer'] = self.context['request'].user
        
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
                 'status', 'notes']
    
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
            
            # Set confirmed_at if status is confirmed
            if new_status == 'confirmed' and not booking.confirmed_at:
                booking.confirmed_at = timezone.now()
                booking.save(update_fields=['confirmed_at'])
        
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
                 'is_upcoming', 'is_past', 'notes', 'created_at', 
                 'updated_at', 'confirmed_at']