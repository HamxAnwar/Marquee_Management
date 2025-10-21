from rest_framework import serializers
from decimal import Decimal
from .models import PricingRule, PriceCalculation, BudgetSuggestion, SuggestedMenuItem
from apps.core.serializers import HallListSerializer, DiscountTierSerializer
from apps.menu.serializers import MenuItemListSerializer
from apps.bookings.serializers import BookingListSerializer


class PricingRuleSerializer(serializers.ModelSerializer):
    """Serializer for PricingRule model"""
    applicable_halls = HallListSerializer(many=True, read_only=True)
    rule_type_display = serializers.CharField(source='get_rule_type_display', read_only=True)
    
    class Meta:
        model = PricingRule
        fields = ['id', 'name', 'rule_type', 'rule_type_display', 'value',
                 'min_guests', 'max_guests', 'applicable_halls', 'applicable_days',
                 'is_active', 'valid_from', 'valid_until', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate_value(self, value):
        if value < 0:
            raise serializers.ValidationError("Value cannot be negative.")
        return value


class PriceCalculationSerializer(serializers.ModelSerializer):
    """Serializer for PriceCalculation model"""
    booking = BookingListSerializer(read_only=True)
    guest_discount_tier = DiscountTierSerializer(read_only=True)
    
    class Meta:
        model = PriceCalculation
        fields = ['id', 'booking', 'hall_base_price', 'menu_subtotal',
                 'guest_discount_tier', 'guest_discount_amount',
                 'service_charge_rate', 'service_charge_amount',
                 'tax_rate', 'tax_amount', 'subtotal_before_discount',
                 'total_discount', 'subtotal_after_discount', 'grand_total',
                 'price_per_person', 'calculated_at']
        read_only_fields = ['id', 'calculated_at']


class SuggestedMenuItemSerializer(serializers.ModelSerializer):
    """Serializer for SuggestedMenuItem model"""
    menu_item = MenuItemListSerializer(read_only=True)
    menu_item_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = SuggestedMenuItem
        fields = ['id', 'menu_item', 'menu_item_id', 'suggested_quantity', 'estimated_cost']
        read_only_fields = ['id']


class BudgetSuggestionSerializer(serializers.ModelSerializer):
    """Serializer for BudgetSuggestion model"""
    hall = HallListSerializer(read_only=True)
    suggested_menu_items = SuggestedMenuItemSerializer(source='suggestedmenuitem_set', many=True, read_only=True)
    
    class Meta:
        model = BudgetSuggestion
        fields = ['id', 'target_budget', 'guest_count', 'hall',
                 'suggested_per_person_budget', 'total_estimated_cost',
                 'variance_percentage', 'suggested_menu_items',
                 'is_accepted', 'created_at']
        read_only_fields = ['id', 'created_at']


class PriceCalculationRequestSerializer(serializers.Serializer):
    """Serializer for price calculation requests"""
    hall_id = serializers.IntegerField()
    guest_count = serializers.IntegerField(min_value=1)
    menu_items = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        ),
        help_text="List of objects with menu_item_id, variant_id (optional), quantity"
    )
    event_date = serializers.DateField(required=False)
    
    def validate_menu_items(self, value):
        """Validate menu items structure"""
        for item in value:
            if 'menu_item_id' not in item:
                raise serializers.ValidationError("Each menu item must have menu_item_id")
            if 'quantity' not in item:
                raise serializers.ValidationError("Each menu item must have quantity")
            
            try:
                int(item['menu_item_id'])
                int(item['quantity'])
            except (ValueError, TypeError):
                raise serializers.ValidationError("menu_item_id and quantity must be integers")
            
            if int(item['quantity']) <= 0:
                raise serializers.ValidationError("Quantity must be greater than zero")
        
        return value


class PriceCalculationResponseSerializer(serializers.Serializer):
    """Serializer for price calculation responses"""
    hall_base_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    menu_subtotal = serializers.DecimalField(max_digits=12, decimal_places=2)
    guest_discount_tier = DiscountTierSerializer(allow_null=True)
    guest_discount_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    service_charge_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    service_charge_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    tax_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    subtotal_before_discount = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_discount = serializers.DecimalField(max_digits=12, decimal_places=2)
    subtotal_after_discount = serializers.DecimalField(max_digits=12, decimal_places=2)
    grand_total = serializers.DecimalField(max_digits=12, decimal_places=2)
    price_per_person = serializers.DecimalField(max_digits=10, decimal_places=2)
    breakdown = serializers.DictField()


class BudgetSuggestionRequestSerializer(serializers.Serializer):
    """Serializer for budget suggestion requests"""
    target_budget = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    guest_count = serializers.IntegerField(min_value=1)
    hall_id = serializers.IntegerField(required=False)
    preferences = serializers.DictField(
        required=False,
        help_text="Optional preferences like vegetarian_only, exclude_categories, etc."
    )
    
    def validate_target_budget(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target budget must be greater than zero.")
        return value


class BudgetSuggestionResponseSerializer(serializers.Serializer):
    """Serializer for budget suggestion responses"""
    suggestion_id = serializers.IntegerField()
    target_budget = serializers.DecimalField(max_digits=12, decimal_places=2)
    guest_count = serializers.IntegerField()
    hall = HallListSerializer(allow_null=True)
    suggested_per_person_budget = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_estimated_cost = serializers.DecimalField(max_digits=12, decimal_places=2)
    variance_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    suggested_menu_items = SuggestedMenuItemSerializer(many=True)
    breakdown = serializers.DictField()
    notes = serializers.CharField(required=False)


class MenuPricingSerializer(serializers.Serializer):
    """Serializer for individual menu item pricing"""
    menu_item_id = serializers.IntegerField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1)
    guest_count = serializers.IntegerField(min_value=1)
    
    def validate(self, data):
        # Basic validation - more complex validation would be done in the view
        if data['quantity'] <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero")
        if data['guest_count'] <= 0:
            raise serializers.ValidationError("Guest count must be greater than zero")
        return data


class MenuPricingResponseSerializer(serializers.Serializer):
    """Serializer for menu item pricing response"""
    menu_item = MenuItemListSerializer()
    variant = serializers.DictField(required=False, allow_null=True)
    base_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    final_unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    quantity = serializers.IntegerField()
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2)
    applicable_discounts = serializers.ListField(child=serializers.DictField())