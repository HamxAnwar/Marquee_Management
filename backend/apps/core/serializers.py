from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Hall, DiscountTier, UserProfile


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name']
        read_only_fields = ['id']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'phone', 'address', 'preferred_contact', 'created_at']
        read_only_fields = ['created_at']


class HallSerializer(serializers.ModelSerializer):
    """Serializer for Hall model"""
    
    class Meta:
        model = Hall
        fields = ['id', 'name', 'description', 'capacity', 'base_price', 
                 'is_active', 'image', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_capacity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Capacity must be greater than zero.")
        return value
    
    def validate_base_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Base price cannot be negative.")
        return value


class HallListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing halls"""
    
    class Meta:
        model = Hall
        fields = ['id', 'name', 'capacity', 'base_price', 'is_active']


class DiscountTierSerializer(serializers.ModelSerializer):
    """Serializer for DiscountTier model"""
    
    class Meta:
        model = DiscountTier
        fields = ['id', 'name', 'min_guests', 'max_guests', 
                 'discount_percentage', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate(self, data):
        """Validate that max_guests is greater than min_guests"""
        if data.get('max_guests') and data.get('min_guests'):
            if data['max_guests'] <= data['min_guests']:
                raise serializers.ValidationError(
                    "Maximum guests must be greater than minimum guests."
                )
        return data
    
    def validate_discount_percentage(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Discount percentage must be between 0 and 100."
            )
        return value


class DiscountTierApplicableSerializer(serializers.ModelSerializer):
    """Serializer for finding applicable discount tier for guest count"""
    applies_to_guest_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DiscountTier
        fields = ['id', 'name', 'min_guests', 'max_guests', 
                 'discount_percentage', 'applies_to_guest_count']
    
    def get_applies_to_guest_count(self, obj):
        guest_count = self.context.get('guest_count')
        if guest_count:
            return obj.min_guests <= guest_count <= obj.max_guests
        return None