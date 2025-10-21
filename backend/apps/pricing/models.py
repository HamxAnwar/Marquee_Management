from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from apps.core.models import Hall, DiscountTier
from apps.menu.models import MenuItem
from apps.bookings.models import Booking


class PricingRule(models.Model):
    """Custom pricing rules for different scenarios"""
    
    RULE_TYPES = [
        ('percentage_discount', 'Percentage Discount'),
        ('fixed_discount', 'Fixed Amount Discount'),
        ('minimum_charge', 'Minimum Charge'),
        ('service_charge', 'Service Charge'),
    ]
    
    name = models.CharField(max_length=100)
    rule_type = models.CharField(max_length=20, choices=RULE_TYPES)
    value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Percentage (0-100) or fixed amount"
    )
    
    # Conditions for applying the rule
    min_guests = models.IntegerField(null=True, blank=True)
    max_guests = models.IntegerField(null=True, blank=True)
    applicable_halls = models.ManyToManyField(Hall, blank=True)
    applicable_days = models.CharField(
        max_length=7,
        blank=True,
        help_text="Days of week: 1234567 (Mon-Sun), leave blank for all days"
    )
    
    # Active status
    is_active = models.BooleanField(default=True)
    valid_from = models.DateField(null=True, blank=True)
    valid_until = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        
    def __str__(self):
        return f"{self.name} ({self.get_rule_type_display()})"


class PriceCalculation(models.Model):
    """Store calculated pricing for bookings with breakdown"""
    
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='price_calculation')
    
    # Base calculations
    hall_base_price = models.DecimalField(max_digits=10, decimal_places=2)
    menu_subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Applied discounts
    guest_discount_tier = models.ForeignKey(
        DiscountTier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    guest_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Additional charges
    service_charge_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Service charge percentage"
    )
    service_charge_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Tax percentage"
    )
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Final totals
    subtotal_before_discount = models.DecimalField(max_digits=12, decimal_places=2)
    total_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    subtotal_after_discount = models.DecimalField(max_digits=12, decimal_places=2)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Per-person calculations
    price_per_person = models.DecimalField(max_digits=10, decimal_places=2)
    
    calculated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-calculated_at']
        
    def __str__(self):
        return f"Price calculation for {self.booking.booking_id}"
    
    def recalculate(self):
        """Recalculate all pricing based on current rules"""
        # This method will contain the pricing logic
        # Implementation will be added in the pricing service
        pass


class BudgetSuggestion(models.Model):
    """Store budget-based menu suggestions"""
    
    # Request parameters
    target_budget = models.DecimalField(max_digits=12, decimal_places=2)
    guest_count = models.IntegerField(validators=[MinValueValidator(1)])
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, null=True, blank=True)
    
    # Calculated suggestion
    suggested_per_person_budget = models.DecimalField(max_digits=10, decimal_places=2)
    total_estimated_cost = models.DecimalField(max_digits=12, decimal_places=2)
    variance_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="How close to target budget (+ or - %)"
    )
    
    # Menu composition
    suggested_menu_items = models.ManyToManyField(
        MenuItem,
        through='SuggestedMenuItem',
        related_name='budget_suggestions'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    is_accepted = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Budget suggestion: ${self.target_budget} for {self.guest_count} guests"


class SuggestedMenuItem(models.Model):
    """Junction table for budget suggestions and menu items"""
    
    suggestion = models.ForeignKey(BudgetSuggestion, on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    suggested_quantity = models.IntegerField(validators=[MinValueValidator(1)])
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        unique_together = ['suggestion', 'menu_item']
        
    def __str__(self):
        return f"{self.menu_item.name} x{self.suggested_quantity} (${self.estimated_cost})"
