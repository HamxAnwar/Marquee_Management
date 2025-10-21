from django.db import models
from django.core.validators import MinValueValidator


class MenuCategory(models.Model):
    """Categories for organizing menu items"""
    
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    display_order = models.IntegerField(default=0, help_text="Order for displaying categories")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['display_order', 'name']
        verbose_name_plural = "Menu Categories"
        
    def __str__(self):
        return self.name


class MenuItem(models.Model):
    """Individual menu items with pricing"""
    
    SERVING_TYPES = [
        ('per_plate', 'Per Plate'),
        ('per_kg', 'Per KG'),
        ('per_piece', 'Per Piece'),
        ('per_portion', 'Per Portion'),
    ]
    
    name = models.CharField(max_length=100)
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, related_name='items')
    description = models.TextField(blank=True)
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Base price per serving"
    )
    serving_type = models.CharField(
        max_length=15,
        choices=SERVING_TYPES,
        default='per_plate'
    )
    is_vegetarian = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True)
    ingredients = models.TextField(blank=True, help_text="List of main ingredients")
    preparation_time = models.IntegerField(
        default=30,
        validators=[MinValueValidator(0)],
        help_text="Preparation time in minutes"
    )
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category__display_order', 'display_order', 'name']
        unique_together = ['name', 'category']
        
    def __str__(self):
        return f"{self.name} ({self.category.name}) - ${self.base_price}/{self.get_serving_type_display()}"


class MenuItemVariant(models.Model):
    """Variants of menu items (e.g., different sizes, spice levels)"""
    
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=50, help_text="e.g., Large, Medium, Extra Spicy")
    price_modifier = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Additional cost (can be negative for discounts)"
    )
    is_available = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['menu_item', 'name']
        
    def __str__(self):
        return f"{self.menu_item.name} - {self.name}"
    
    @property
    def final_price(self):
        return self.menu_item.base_price + self.price_modifier
