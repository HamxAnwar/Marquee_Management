from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from apps.core.models import Hall, DiscountTier, Organization
from apps.menu.models import MenuItem, MenuPackage
from apps.bookings.models import Booking


class PricingRule(models.Model):
    """Custom pricing rules for different scenarios within an organization"""

    RULE_TYPES = [
        ("percentage_discount", "Percentage Discount"),
        ("fixed_discount", "Fixed Amount Discount"),
        ("percentage_surcharge", "Percentage Surcharge"),
        ("fixed_surcharge", "Fixed Amount Surcharge"),
        ("service_charge", "Service Charge"),
        ("tax", "Tax"),
        ("platform_fee", "Platform Fee"),
    ]

    APPLICABILITY = [
        ("hall", "Hall Rental"),
        ("menu", "Menu Items"),
        ("package", "Menu Packages"),
        ("total", "Total Booking"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="pricing_rules"
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    rule_type = models.CharField(max_length=25, choices=RULE_TYPES)
    applies_to = models.CharField(max_length=20, choices=APPLICABILITY, default="total")

    # Rule value
    percentage = models.DecimalField(
        max_digits=8,
        decimal_places=4,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Percentage value (0-100)",
    )
    fixed_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Fixed amount value",
    )

    # Conditions for applying the rule
    min_guests = models.IntegerField(
        null=True, blank=True, validators=[MinValueValidator(1)]
    )
    max_guests = models.IntegerField(
        null=True, blank=True, validators=[MinValueValidator(1)]
    )
    min_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )
    max_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )

    # Date and day conditions
    applicable_halls = models.ManyToManyField(Hall, blank=True)
    applicable_event_types = models.TextField(
        blank=True, help_text="Comma-separated event types (wedding,corporate,etc)"
    )
    applicable_days = models.CharField(
        max_length=7,
        blank=True,
        help_text="Days of week: 1234567 (Mon-Sun), leave blank for all days",
    )

    # Date range
    valid_from = models.DateField(null=True, blank=True)
    valid_until = models.DateField(null=True, blank=True)

    # Timing conditions
    peak_hours_only = models.BooleanField(default=False)
    peak_start_time = models.TimeField(null=True, blank=True)
    peak_end_time = models.TimeField(null=True, blank=True)

    # Priority and status
    priority = models.IntegerField(
        default=0, help_text="Higher number = higher priority when multiple rules apply"
    )
    is_active = models.BooleanField(default=True)
    is_cumulative = models.BooleanField(
        default=True, help_text="Can be combined with other rules"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["organization", "-priority", "name"]

    def __str__(self):
        return f"{self.organization.name} - {self.name}"

    def clean(self):
        from django.core.exceptions import ValidationError

        # Validate that either percentage or fixed_amount is provided
        if not self.percentage and not self.fixed_amount:
            raise ValidationError("Either percentage or fixed amount must be specified")

        if self.percentage and self.fixed_amount:
            raise ValidationError("Specify either percentage or fixed amount, not both")

        # Validate min/max ranges
        if self.min_guests and self.max_guests and self.min_guests >= self.max_guests:
            raise ValidationError("Min guests must be less than max guests")

        if self.min_amount and self.max_amount and self.min_amount >= self.max_amount:
            raise ValidationError("Min amount must be less than max amount")

        # Validate peak hours
        if self.peak_hours_only and (
            not self.peak_start_time or not self.peak_end_time
        ):
            raise ValidationError(
                "Peak start and end times required when peak_hours_only is True"
            )

    @property
    def rule_value(self):
        return self.percentage if self.percentage else self.fixed_amount

    @property
    def applicable_event_types_list(self):
        return [
            event_type.strip()
            for event_type in self.applicable_event_types.split(",")
            if event_type.strip()
        ]

    def applies_to_booking(self, booking_data):
        """Check if this rule applies to a given booking"""
        # This method would contain logic to check if the rule applies
        # based on the booking data (guest count, date, event type, etc.)
        return True  # Simplified for now


class DynamicPricing(models.Model):
    """Dynamic pricing configuration for organizations"""

    organization = models.OneToOneField(
        Organization, on_delete=models.CASCADE, related_name="dynamic_pricing"
    )

    # Demand-based pricing
    enable_demand_pricing = models.BooleanField(default=False)
    high_demand_multiplier = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal("1.50"),
        validators=[MinValueValidator(Decimal("1.0"))],
    )
    low_demand_multiplier = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal("0.80"),
        validators=[MinValueValidator(Decimal("0.1"))],
    )

    # Seasonal pricing
    enable_seasonal_pricing = models.BooleanField(default=False)
    peak_season_months = models.CharField(
        max_length=24, blank=True, help_text="Comma-separated month numbers (1-12)"
    )
    peak_season_multiplier = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal("1.25"),
        validators=[MinValueValidator(Decimal("1.0"))],
    )

    # Early booking discounts
    enable_early_booking = models.BooleanField(default=False)
    early_booking_days = models.IntegerField(
        default=60,
        validators=[MinValueValidator(1)],
        help_text="Days in advance for early booking discount",
    )
    early_booking_discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("10.00"),
        validators=[MinValueValidator(0), MaxValueValidator(50)],
    )

    # Last-minute pricing
    enable_lastminute_pricing = models.BooleanField(default=False)
    lastminute_days = models.IntegerField(
        default=7,
        validators=[MinValueValidator(1)],
        help_text="Days before event for last-minute pricing",
    )
    lastminute_discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("15.00"),
        validators=[MinValueValidator(0), MaxValueValidator(50)],
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.organization.name} - Dynamic Pricing"

    @property
    def peak_season_months_list(self):
        return [
            int(month.strip())
            for month in self.peak_season_months.split(",")
            if month.strip().isdigit()
        ]


class PriceCalculation(models.Model):
    """Store calculated pricing for bookings with detailed breakdown"""

    booking = models.OneToOneField(
        Booking, on_delete=models.CASCADE, related_name="price_calculation"
    )

    # Base calculations
    hall_base_price = models.DecimalField(max_digits=12, decimal_places=2)
    menu_subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    package_subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Applied discounts
    guest_discount_tier = models.ForeignKey(
        DiscountTier, on_delete=models.SET_NULL, null=True, blank=True
    )
    guest_discount_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    early_booking_discount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    lastminute_discount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    promotional_discount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    total_discounts = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Additional charges
    seasonal_surcharge = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    demand_surcharge = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    weekend_surcharge = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Service charges and fees
    service_charge_rate = models.DecimalField(
        max_digits=8, decimal_places=4, default=0, help_text="Service charge percentage"
    )
    service_charge_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )

    # Taxes
    tax_rate = models.DecimalField(
        max_digits=8, decimal_places=4, default=0, help_text="Tax percentage"
    )
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Platform fees (for marketplace model)
    platform_commission_rate = models.DecimalField(
        max_digits=8,
        decimal_places=4,
        default=0,
        help_text="Platform commission percentage",
    )
    platform_commission = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )

    # Final totals
    subtotal_before_discount = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal_after_discount = models.DecimalField(max_digits=12, decimal_places=2)
    total_before_tax = models.DecimalField(max_digits=12, decimal_places=2)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2)

    # Per-person calculations
    price_per_person = models.DecimalField(max_digits=10, decimal_places=2)

    # Breakdown for transparency
    breakdown_json = models.TextField(
        blank=True, help_text="JSON representation of detailed pricing breakdown"
    )

    # Metadata
    calculated_at = models.DateTimeField(auto_now_add=True)
    calculated_by = models.ForeignKey(
        "auth.User", on_delete=models.SET_NULL, null=True, blank=True
    )

    # Applied pricing rules reference
    applied_rules = models.ManyToManyField(
        PricingRule, blank=True, related_name="calculations"
    )

    class Meta:
        ordering = ["-calculated_at"]

    def __str__(self):
        return f"Price calculation for {self.booking.booking_id} - ${self.grand_total}"

    def recalculate(self):
        """Recalculate all pricing based on current rules"""
        # This method would contain the comprehensive pricing logic
        # For now, just ensure basic calculations
        self.total_discounts = (
            self.guest_discount_amount
            + self.early_booking_discount
            + self.lastminute_discount
            + self.promotional_discount
        )

        self.subtotal_after_discount = (
            self.subtotal_before_discount - self.total_discounts
        )

        self.total_before_tax = (
            self.subtotal_after_discount
            + self.seasonal_surcharge
            + self.demand_surcharge
            + self.weekend_surcharge
            + self.service_charge_amount
        )

        self.grand_total = self.total_before_tax + self.tax_amount

        if self.booking.guest_count > 0:
            self.price_per_person = self.grand_total / self.booking.guest_count

        self.save()

    @property
    def total_surcharges(self):
        return self.seasonal_surcharge + self.demand_surcharge + self.weekend_surcharge

    @property
    def savings_amount(self):
        return self.total_discounts

    @property
    def savings_percentage(self):
        if self.subtotal_before_discount > 0:
            return (self.total_discounts / self.subtotal_before_discount) * 100
        return 0


class BudgetSuggestion(models.Model):
    """Store budget-based menu suggestions"""

    # Request parameters
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="budget_suggestions"
    )
    target_budget = models.DecimalField(max_digits=12, decimal_places=2)
    guest_count = models.IntegerField(validators=[MinValueValidator(1)])
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, null=True, blank=True)
    event_type = models.CharField(max_length=50, blank=True)

    # Customer preferences
    dietary_preferences = models.TextField(
        blank=True, help_text="JSON object with dietary preferences"
    )
    excluded_categories = models.TextField(
        blank=True, help_text="Comma-separated category IDs to exclude"
    )
    preferred_categories = models.TextField(
        blank=True, help_text="Comma-separated category IDs to prefer"
    )

    # Calculated suggestion
    suggested_per_person_budget = models.DecimalField(max_digits=10, decimal_places=2)
    total_estimated_cost = models.DecimalField(max_digits=12, decimal_places=2)
    variance_percentage = models.DecimalField(
        max_digits=8,
        decimal_places=4,
        help_text="How close to target budget (+ or - %)",
    )

    # Menu composition
    suggested_menu_items = models.ManyToManyField(
        MenuItem, through="SuggestedMenuItem", related_name="budget_suggestions"
    )
    suggested_package = models.ForeignKey(
        MenuPackage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="budget_suggestions",
    )

    # Quality score (algorithm confidence)
    suggestion_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Algorithm confidence score (0-100)",
    )

    # Additional metadata
    algorithm_version = models.CharField(max_length=20, default="1.0")
    generation_time_ms = models.IntegerField(
        null=True,
        blank=True,
        help_text="Time taken to generate suggestion in milliseconds",
    )

    # Status
    is_accepted = models.BooleanField(default=False)
    customer_feedback = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        "auth.User", on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.organization.name} - Budget suggestion: ${self.target_budget} for {self.guest_count} guests"

    @property
    def is_within_budget(self):
        return abs(self.variance_percentage) <= 10  # Within 10%

    @property
    def excluded_categories_list(self):
        return [
            int(cat_id.strip())
            for cat_id in self.excluded_categories.split(",")
            if cat_id.strip().isdigit()
        ]

    @property
    def preferred_categories_list(self):
        return [
            int(cat_id.strip())
            for cat_id in self.preferred_categories.split(",")
            if cat_id.strip().isdigit()
        ]


class SuggestedMenuItem(models.Model):
    """Junction table for budget suggestions and menu items"""

    suggestion = models.ForeignKey(
        BudgetSuggestion, on_delete=models.CASCADE, related_name="suggestion_items"
    )
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    variant = models.ForeignKey(
        "menu.MenuItemVariant", on_delete=models.CASCADE, null=True, blank=True
    )
    suggested_quantity = models.DecimalField(
        max_digits=10, decimal_places=3, validators=[MinValueValidator(0)]
    )
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2)
    priority_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Item priority in suggestion (higher = more important)",
    )
    is_essential = models.BooleanField(
        default=False, help_text="Essential item that should not be removed"
    )

    class Meta:
        unique_together = ["suggestion", "menu_item", "variant"]
        ordering = ["-priority_score", "menu_item__category__display_order"]

    def __str__(self):
        item_name = f"{self.menu_item.name}"
        if self.variant:
            item_name += f" ({self.variant.name})"
        return f"{item_name} x{self.suggested_quantity} (${self.estimated_cost})"


class PricingHistory(models.Model):
    """Track pricing changes for analytics"""

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="pricing_history"
    )

    # What changed
    entity_type = models.CharField(
        max_length=20,
        choices=[
            ("hall", "Hall"),
            ("menu_item", "Menu Item"),
            ("package", "Menu Package"),
            ("discount_tier", "Discount Tier"),
            ("pricing_rule", "Pricing Rule"),
        ],
    )
    entity_id = models.IntegerField()
    field_name = models.CharField(max_length=50)

    # Change details
    old_value = models.TextField()
    new_value = models.TextField()
    change_reason = models.TextField(blank=True)

    # Metadata
    changed_by = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    changed_at = models.DateTimeField(auto_now_add=True)

    # Impact tracking
    affected_bookings_count = models.IntegerField(default=0)

    class Meta:
        ordering = ["-changed_at"]
        indexes = [
            models.Index(fields=["organization", "entity_type", "entity_id"]),
            models.Index(fields=["changed_at"]),
        ]

    def __str__(self):
        return f"{self.organization.name} - {self.entity_type} {self.entity_id}: {self.field_name} changed"


# Signals for automatic calculations
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver


@receiver(post_save, sender=Booking)
def create_price_calculation(sender, instance, created, **kwargs):
    if created:
        # Create initial price calculation
        PriceCalculation.objects.get_or_create(
            booking=instance,
            defaults={
                "hall_base_price": instance.hall.base_price,
                "subtotal_before_discount": instance.hall.base_price,
                "subtotal_after_discount": instance.hall.base_price,
                "total_before_tax": instance.hall.base_price,
                "grand_total": instance.hall.base_price,
                "price_per_person": instance.hall.base_price / instance.guest_count,
            },
        )


@receiver(post_save, sender=PricingRule)
def track_pricing_rule_changes(sender, instance, created, **kwargs):
    if not created:
        # Track changes for analytics
        # Implementation would compare old vs new values
        pass
