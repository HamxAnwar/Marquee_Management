from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.utils import timezone
from apps.core.models import Hall
from apps.menu.models import MenuItem, MenuItemVariant


class Booking(models.Model):
    """Main booking model for event reservations"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Confirmation'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    # Basic booking information
    booking_id = models.CharField(max_length=20, unique=True, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE)
    
    # Event details
    event_date = models.DateField()
    event_time = models.TimeField()
    event_type = models.CharField(
        max_length=50,
        choices=[
            ('wedding', 'Wedding'),
            ('birthday', 'Birthday Party'),
            ('corporate', 'Corporate Event'),
            ('anniversary', 'Anniversary'),
            ('other', 'Other'),
        ],
        default='wedding'
    )
    guest_count = models.IntegerField(validators=[MinValueValidator(1)])
    
    # Contact and special requirements
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField()
    special_requirements = models.TextField(blank=True)
    
    # Pricing
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Status and timestamps
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    # Additional fields
    notes = models.TextField(blank=True, help_text="Internal notes for admin")
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Booking {self.booking_id} - {self.customer.get_full_name()} ({self.event_date})"
    
    def save(self, *args, **kwargs):
        if not self.booking_id:
            # Generate unique booking ID
            import uuid
            self.booking_id = f"BK{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
    
    @property
    def is_upcoming(self):
        return self.event_date > timezone.now().date()
    
    @property
    def is_past(self):
        return self.event_date < timezone.now().date()


class BookingMenuItem(models.Model):
    """Junction table for booking and menu items with quantities"""
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='menu_items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    variant = models.ForeignKey(MenuItemVariant, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Price at the time of booking"
    )
    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="quantity * unit_price"
    )
    notes = models.TextField(blank=True, help_text="Special instructions for this item")
    
    class Meta:
        unique_together = ['booking', 'menu_item', 'variant']
        
    def __str__(self):
        item_name = f"{self.menu_item.name}"
        if self.variant:
            item_name += f" ({self.variant.name})"
        return f"{self.booking.booking_id} - {item_name} x{self.quantity}"
    
    def save(self, *args, **kwargs):
        # Auto-calculate total price
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class BookingStatusHistory(models.Model):
    """Track status changes for bookings"""
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='status_history')
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    reason = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = "Booking Status Histories"
        
    def __str__(self):
        return f"{self.booking.booking_id}: {self.old_status} → {self.new_status}"
