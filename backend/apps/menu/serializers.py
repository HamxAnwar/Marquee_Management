from rest_framework import serializers
from .models import MenuCategory, MenuItem, MenuItemVariant


class MenuCategorySerializer(serializers.ModelSerializer):
    """Serializer for MenuCategory model"""
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'description', 'display_order', 
                 'is_active', 'items_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_items_count(self, obj):
        return obj.items.filter(is_available=True).count()


class MenuItemVariantSerializer(serializers.ModelSerializer):
    """Serializer for MenuItemVariant model"""
    final_price = serializers.ReadOnlyField()
    
    class Meta:
        model = MenuItemVariant
        fields = ['id', 'name', 'price_modifier', 'final_price', 'is_available']
        read_only_fields = ['id']
    
    def validate_price_modifier(self, value):
        # Ensure the final price won't be negative
        if hasattr(self, 'instance') and self.instance:
            base_price = self.instance.menu_item.base_price
            if base_price + value < 0:
                raise serializers.ValidationError(
                    "Price modifier results in negative final price."
                )
        return value


class MenuItemSerializer(serializers.ModelSerializer):
    """Serializer for MenuItem model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    variants = MenuItemVariantSerializer(many=True, read_only=True)
    serving_type_display = serializers.CharField(source='get_serving_type_display', read_only=True)
    
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'category', 'category_name', 'description', 
                 'base_price', 'serving_type', 'serving_type_display', 
                 'is_vegetarian', 'is_available', 'image', 'ingredients', 
                 'preparation_time', 'display_order', 'variants', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_base_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Base price cannot be negative.")
        return value
    
    def validate_preparation_time(self, value):
        if value < 0:
            raise serializers.ValidationError("Preparation time cannot be negative.")
        return value


class MenuItemListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing menu items"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    serving_type_display = serializers.CharField(source='get_serving_type_display', read_only=True)
    has_variants = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'category_name', 'base_price', 'serving_type_display', 
                 'is_vegetarian', 'is_available', 'has_variants']
    
    def get_has_variants(self, obj):
        return obj.variants.exists()


class MenuItemDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual menu item view"""
    category = MenuCategorySerializer(read_only=True)
    variants = MenuItemVariantSerializer(many=True, read_only=True)
    serving_type_display = serializers.CharField(source='get_serving_type_display', read_only=True)
    
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'category', 'description', 'base_price', 
                 'serving_type', 'serving_type_display', 'is_vegetarian', 
                 'is_available', 'image', 'ingredients', 'preparation_time', 
                 'display_order', 'variants', 'created_at', 'updated_at']


class MenuCategoryWithItemsSerializer(serializers.ModelSerializer):
    """Category serializer with nested menu items"""
    items = MenuItemListSerializer(many=True, read_only=True)
    
    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'description', 'display_order', 'is_active', 'items']
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Only include available items
        representation['items'] = [
            item for item in representation['items'] 
            if item.get('is_available', False)
        ]
        return representation


class MenuItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating menu items with variants"""
    variants_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        help_text="List of variant objects with name, price_modifier, is_available"
    )
    
    class Meta:
        model = MenuItem
        fields = ['name', 'category', 'description', 'base_price', 'serving_type',
                 'is_vegetarian', 'is_available', 'image', 'ingredients', 
                 'preparation_time', 'display_order', 'variants_data']
    
    def create(self, validated_data):
        variants_data = validated_data.pop('variants_data', [])
        menu_item = MenuItem.objects.create(**validated_data)
        
        # Create variants if provided
        for variant_data in variants_data:
            MenuItemVariant.objects.create(menu_item=menu_item, **variant_data)
        
        return menu_item
    
    def to_representation(self, instance):
        return MenuItemSerializer(instance).data