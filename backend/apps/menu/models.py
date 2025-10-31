from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import Organization


class MenuCategory(models.Model):
    """Categories for organizing menu items within an organization"""

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="menu_categories"
    )
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    display_order = models.IntegerField(
        default=0, help_text="Order for displaying categories"
    )
    is_active = models.BooleanField(default=True)
    image = models.ImageField(upload_to="menu_categories/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["organization", "display_order", "name"]
        verbose_name_plural = "Menu Categories"
        unique_together = ["organization", "name"]

    def __str__(self):
        return f"{self.organization.name} - {self.name}"

    @property
    def items_count(self):
        return self.items.filter(is_available=True).count()


class MenuItem(models.Model):
    """Individual menu items with pricing within an organization"""

    SERVING_TYPES = [
        ("per_plate", "Per Plate"),
        ("per_kg", "Per KG"),
        ("per_piece", "Per Piece"),
        ("per_portion", "Per Portion"),
        ("per_person", "Per Person"),
    ]

    DIETARY_TYPES = [
        ("regular", "Regular"),
        ("vegetarian", "Vegetarian"),
        ("vegan", "Vegan"),
        ("halal", "Halal"),
        ("kosher", "Kosher"),
        ("gluten_free", "Gluten Free"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="menu_items"
    )
    category = models.ForeignKey(
        MenuCategory, on_delete=models.CASCADE, related_name="items"
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Base price per serving",
    )
    serving_type = models.CharField(
        max_length=15, choices=SERVING_TYPES, default="per_plate"
    )
    dietary_type = models.CharField(
        max_length=20, choices=DIETARY_TYPES, default="regular"
    )
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    image = models.ImageField(upload_to="menu_items/", blank=True, null=True)

    # Detailed information
    ingredients = models.TextField(blank=True, help_text="List of main ingredients")
    allergens = models.TextField(
        blank=True, help_text="Common allergens (comma-separated)"
    )
    preparation_time = models.IntegerField(
        default=30,
        validators=[MinValueValidator(0)],
        help_text="Preparation time in minutes",
    )
    spice_level = models.IntegerField(
        choices=[
            (0, "No Spice"),
            (1, "Mild"),
            (2, "Medium"),
            (3, "Hot"),
            (4, "Very Hot"),
        ],
        default=0,
    )

    # Nutritional information (optional)
    calories_per_serving = models.IntegerField(null=True, blank=True)

    # Inventory and ordering
    min_order_quantity = models.IntegerField(default=1)
    max_order_quantity = models.IntegerField(null=True, blank=True)

    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["organization", "category__display_order", "display_order", "name"]
        unique_together = ["organization", "category", "name"]

    def __str__(self):
        return f"{self.organization.name} - {self.name} ({self.category.name}) - ${self.base_price}/{self.get_serving_type_display()}"

    @property
    def is_vegetarian(self):
        return self.dietary_type in ["vegetarian", "vegan"]

    @property
    def is_vegan(self):
        return self.dietary_type == "vegan"

    @property
    def allergens_list(self):
        return [
            allergen.strip()
            for allergen in self.allergens.split(",")
            if allergen.strip()
        ]

    @property
    def ingredients_list(self):
        return [
            ingredient.strip()
            for ingredient in self.ingredients.split(",")
            if ingredient.strip()
        ]

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.category.organization != self.organization:
            raise ValidationError(
                "Menu item and category must belong to the same organization"
            )


class MenuItemVariant(models.Model):
    """Variants of menu items (e.g., different sizes, spice levels, customizations)"""

    menu_item = models.ForeignKey(
        MenuItem, on_delete=models.CASCADE, related_name="variants"
    )
    name = models.CharField(max_length=50, help_text="e.g., Large, Medium, Extra Spicy")
    description = models.TextField(blank=True)
    price_modifier = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Additional cost (can be negative for discounts)",
    )
    is_available = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)

    class Meta:
        unique_together = ["menu_item", "name"]
        ordering = ["display_order", "name"]

    def __str__(self):
        return f"{self.menu_item.name} - {self.name}"

    @property
    def final_price(self):
        return self.menu_item.base_price + self.price_modifier


class MenuPackage(models.Model):
    """Pre-defined menu packages for events"""

    PACKAGE_TYPES = [
        ("wedding", "Wedding Package"),
        ("corporate", "Corporate Package"),
        ("birthday", "Birthday Package"),
        ("custom", "Custom Package"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="menu_packages"
    )
    name = models.CharField(max_length=100)
    description = models.TextField()
    package_type = models.CharField(
        max_length=20, choices=PACKAGE_TYPES, default="custom"
    )

    # Pricing
    base_price_per_person = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Base price per person for this package",
    )
    min_guests = models.IntegerField(validators=[MinValueValidator(1)])
    max_guests = models.IntegerField(null=True, blank=True)

    # Package details
    menu_items = models.ManyToManyField(
        MenuItem, through="PackageMenuItem", related_name="packages"
    )

    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    image = models.ImageField(upload_to="menu_packages/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["organization", "package_type", "name"]
        unique_together = ["organization", "name"]

    def __str__(self):
        return f"{self.organization.name} - {self.name}"

    @property
    def total_items(self):
        return self.package_items.count()

    def calculate_total_cost(self, guest_count):
        """Calculate total cost for given number of guests"""
        return self.base_price_per_person * guest_count


class PackageMenuItem(models.Model):
    """Junction table for packages and menu items with quantities"""

    package = models.ForeignKey(
        MenuPackage, on_delete=models.CASCADE, related_name="package_items"
    )
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    variant = models.ForeignKey(
        MenuItemVariant, on_delete=models.CASCADE, null=True, blank=True
    )
    quantity_per_person = models.DecimalField(
        max_digits=8,
        decimal_places=3,
        validators=[MinValueValidator(0)],
        help_text="Quantity per person (e.g., 0.5 for half plate per person)",
    )
    is_optional = models.BooleanField(default=False)
    additional_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Additional cost per person if item is optional",
    )

    class Meta:
        unique_together = ["package", "menu_item", "variant"]

    def __str__(self):
        item_name = f"{self.menu_item.name}"
        if self.variant:
            item_name += f" ({self.variant.name})"
        return f"{self.package.name} - {item_name}"


class MenuCustomization(models.Model):
    """Available customizations for menu items"""

    CUSTOMIZATION_TYPES = [
        ("spice_level", "Spice Level"),
        ("cooking_style", "Cooking Style"),
        ("portion_size", "Portion Size"),
        ("ingredient_add", "Add Ingredient"),
        ("ingredient_remove", "Remove Ingredient"),
        ("other", "Other"),
    ]

    menu_item = models.ForeignKey(
        MenuItem, on_delete=models.CASCADE, related_name="customizations"
    )
    name = models.CharField(max_length=100)
    customization_type = models.CharField(max_length=20, choices=CUSTOMIZATION_TYPES)
    description = models.TextField(blank=True)

    # Pricing
    price_modifier = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text="Additional cost for this customization",
    )

    # Options for this customization (JSON field would be better, but using TextField for simplicity)
    available_options = models.TextField(
        blank=True, help_text="Comma-separated options for this customization"
    )

    is_required = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["menu_item", "display_order", "name"]
        unique_together = ["menu_item", "name"]

    def __str__(self):
        return f"{self.menu_item.name} - {self.name}"

    @property
    def options_list(self):
        return [
            option.strip()
            for option in self.available_options.split(",")
            if option.strip()
        ]


class MenuReview(models.Model):
    """Customer reviews for menu items"""

    menu_item = models.ForeignKey(
        MenuItem, on_delete=models.CASCADE, related_name="reviews"
    )
    customer = models.ForeignKey(
        "auth.User", on_delete=models.CASCADE, related_name="menu_reviews"
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars",
    )
    title = models.CharField(max_length=200, blank=True)
    review = models.TextField()
    is_approved = models.BooleanField(default=False)
    is_verified_order = models.BooleanField(default=False)

    # Specific aspects
    taste_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True
    )
    presentation_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True
    )
    value_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ["menu_item", "customer"]

    def __str__(self):
        return (
            f"{self.menu_item.name} - {self.customer.get_full_name()} ({self.rating}★)"
        )


# Signals to ensure organization consistency
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError


@receiver(pre_save, sender=MenuItem)
def validate_menu_item_organization(sender, instance, **kwargs):
    if instance.category.organization != instance.organization:
        raise ValidationError(
            "Menu item and category must belong to the same organization"
        )


@receiver(pre_save, sender=MenuPackage)
def validate_package_organization(sender, instance, **kwargs):
    # This will be validated in the PackageMenuItem save method instead
    pass
