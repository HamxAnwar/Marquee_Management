from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Hall(models.Model):
    """Model representing a hall/marquee venue"""
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    capacity = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Maximum number of guests"
    )
    base_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Base price for hall rental"
    )
    is_active = models.BooleanField(default=True)
    image = models.ImageField(upload_to='halls/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        
    def __str__(self):
        return self.name


class DiscountTier(models.Model):
    """Model for guest-based discount tiers"""
    
    name = models.CharField(max_length=50)
    min_guests = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Minimum number of guests for this tier"
    )
    max_guests = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Maximum number of guests for this tier (inclusive)"
    )
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Discount percentage (0-100)"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['min_guests']
        
    def clean(self):
        from django.core.exceptions import ValidationError
        if self.max_guests <= self.min_guests:
            raise ValidationError('Max guests must be greater than min guests')
    
    def __str__(self):
        return f"{self.name} ({self.min_guests}-{self.max_guests} guests, {self.discount_percentage}% off)"


class UserProfile(models.Model):
    """Extended user profile for customers"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    preferred_contact = models.CharField(
        max_length=10,
        choices=[
            ('phone', 'Phone'),
            ('email', 'Email'),
            ('both', 'Both')
        ],
        default='phone'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} Profile"
