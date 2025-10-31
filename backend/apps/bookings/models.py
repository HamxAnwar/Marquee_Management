from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal
import uuid
from apps.core.models import Hall, Organization
from apps.menu.models import MenuItem, MenuItemVariant, MenuPackage


class Booking(models.Model):
    """Main booking model for event reservations within an organization"""

    STATUS_CHOICES = [
        ("pending", "Pending Confirmation"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
        ("no_show", "No Show"),
    ]

    EVENT_TYPES = [
        ("wedding", "Wedding"),
        ("birthday", "Birthday Party"),
        ("corporate", "Corporate Event"),
        ("anniversary", "Anniversary"),
        ("graduation", "Graduation Party"),
        ("religious", "Religious Event"),
        ("conference", "Conference"),
        ("workshop", "Workshop"),
        ("exhibition", "Exhibition"),
        ("other", "Other"),
    ]

    PAYMENT_STATUS = [
        ("pending", "Payment Pending"),
        ("partial", "Partially Paid"),
        ("paid", "Fully Paid"),
        ("refunded", "Refunded"),
        ("cancelled", "Cancelled"),
    ]

    # Identifiers
    booking_id = models.CharField(max_length=20, unique=True, editable=False)

    # Relationships
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="bookings"
    )
    customer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="bookings"
    )
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name="bookings")

    # Event details
    event_date = models.DateField()
    event_time = models.TimeField()
    event_end_time = models.TimeField(null=True, blank=True)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES, default="wedding")
    event_title = models.CharField(
        max_length=200, blank=True, help_text="Optional event title"
    )
    guest_count = models.IntegerField(validators=[MinValueValidator(1)])
    estimated_guest_count = models.IntegerField(
        null=True, blank=True, help_text="If different from confirmed guest count"
    )

    # Contact information
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField()
    secondary_contact_phone = models.CharField(max_length=20, blank=True)
    contact_person_name = models.CharField(
        max_length=100, blank=True, help_text="If different from customer"
    )

    # Requirements and preferences
    special_requirements = models.TextField(blank=True)
    dietary_requirements = models.TextField(blank=True)
    decoration_requirements = models.TextField(blank=True)
    external_vendors = models.TextField(
        blank=True, help_text="List of external vendors (catering, decoration, etc.)"
    )

    # Menu selection
    selected_package = models.ForeignKey(
        MenuPackage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bookings",
    )
    has_custom_menu = models.BooleanField(default=False)

    # Pricing breakdown
    hall_base_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    menu_subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    package_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    service_charge = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    platform_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Payment information
    payment_status = models.CharField(
        max_length=20, choices=PAYMENT_STATUS, default="pending"
    )
    advance_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0, help_text="Advance payment required"
    )
    advance_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_due = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    internal_notes = models.TextField(
        blank=True, help_text="Internal notes for venue staff"
    )
    customer_notes = models.TextField(blank=True, help_text="Notes visible to customer")

    # Important dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Booking management
    booking_source = models.CharField(
        max_length=20,
        choices=[
            ("website", "Website"),
            ("phone", "Phone"),
            ("email", "Email"),
            ("walk_in", "Walk-in"),
            ("referral", "Referral"),
        ],
        default="website",
    )
    assigned_staff = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_bookings",
        help_text="Staff member responsible for this booking",
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["organization", "event_date"]),
            models.Index(fields=["customer", "status"]),
            models.Index(fields=["hall", "event_date"]),
        ]

    def __str__(self):
        return f"Booking {self.booking_id} - {self.customer.get_full_name()} ({self.event_date})"

    def save(self, *args, **kwargs):
        if not self.booking_id:
            # Generate unique booking ID with organization prefix
            org_prefix = self.organization.slug[:3].upper()
            unique_id = uuid.uuid4().hex[:8].upper()
            self.booking_id = f"{org_prefix}{unique_id}"

        # Calculate balance due
        self.balance_due = self.total_amount - self.advance_paid

        super().save(*args, **kwargs)

    def clean(self):
        from django.core.exceptions import ValidationError

        # Validate hall belongs to organization
        if self.hall.organization != self.organization:
            raise ValidationError("Hall must belong to the same organization")

        # Validate package belongs to organization if selected
        if (
            self.selected_package
            and self.selected_package.organization != self.organization
        ):
            raise ValidationError("Package must belong to the same organization")

        # Validate event date is in the future (for new bookings)
        if not self.pk and self.event_date <= timezone.now().date():
            raise ValidationError("Event date must be in the future")

        # Validate guest count doesn't exceed hall capacity
        if self.guest_count > self.hall.capacity:
            raise ValidationError(
                f"Guest count ({self.guest_count}) exceeds hall capacity ({self.hall.capacity})"
            )

    @property
    def is_upcoming(self):
        return self.event_date > timezone.now().date()

    @property
    def is_past(self):
        return self.event_date < timezone.now().date()

    @property
    def is_today(self):
        return self.event_date == timezone.now().date()

    @property
    def days_until_event(self):
        if self.is_past:
            return 0
        return (self.event_date - timezone.now().date()).days

    @property
    def is_payment_overdue(self):
        # Payment is overdue if event is within 7 days and advance not paid
        return (
            self.days_until_event <= 7
            and self.advance_paid < self.advance_amount
            and self.status in ["pending", "confirmed"]
        )

    @property
    def customer_display_name(self):
        return self.contact_person_name or self.customer.get_full_name()

    def calculate_totals(self):
        """Recalculate all pricing totals"""
        # This would contain the pricing logic
        # For now, just ensure balance_due is calculated
        self.balance_due = self.total_amount - self.advance_paid


class BookingMenuItem(models.Model):
    """Junction table for booking and menu items with quantities"""

    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="menu_items"
    )
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    variant = models.ForeignKey(
        MenuItemVariant, on_delete=models.CASCADE, null=True, blank=True
    )
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0)],
        help_text="Quantity ordered",
    )
    unit_price = models.DecimalField(
        max_digits=10, decimal_places=2, help_text="Price at the time of booking"
    )
    total_price = models.DecimalField(
        max_digits=12, decimal_places=2, help_text="quantity * unit_price"
    )
    notes = models.TextField(blank=True, help_text="Special instructions for this item")

    # Customizations
    customizations = models.TextField(
        blank=True, help_text="JSON field for customization options"
    )

    is_confirmed = models.BooleanField(default=True)
    is_optional = models.BooleanField(default=False)

    class Meta:
        unique_together = ["booking", "menu_item", "variant"]
        ordering = ["menu_item__category__display_order", "menu_item__display_order"]

    def __str__(self):
        item_name = f"{self.menu_item.name}"
        if self.variant:
            item_name += f" ({self.variant.name})"
        return f"{self.booking.booking_id} - {item_name} x{self.quantity}"

    def save(self, *args, **kwargs):
        # Auto-calculate total price
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def clean(self):
        from django.core.exceptions import ValidationError

        # Validate menu item belongs to same organization
        if self.menu_item.organization != self.booking.organization:
            raise ValidationError("Menu item must belong to the same organization")


class BookingStatusHistory(models.Model):
    """Track status changes for bookings"""

    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="status_history"
    )
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    reason = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name_plural = "Booking Status Histories"

    def __str__(self):
        return f"{self.booking.booking_id}: {self.old_status} → {self.new_status}"


class BookingPayment(models.Model):
    """Track payments for bookings"""

    PAYMENT_METHODS = [
        ("cash", "Cash"),
        ("card", "Credit/Debit Card"),
        ("bank_transfer", "Bank Transfer"),
        ("online", "Online Payment"),
        ("cheque", "Cheque"),
        ("other", "Other"),
    ]

    PAYMENT_TYPES = [
        ("advance", "Advance Payment"),
        ("partial", "Partial Payment"),
        ("final", "Final Payment"),
        ("refund", "Refund"),
        ("penalty", "Penalty"),
    ]

    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="payments"
    )
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    payment_date = models.DateTimeField(auto_now_add=True)

    # Payment details
    transaction_id = models.CharField(max_length=100, blank=True)
    reference_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    # Staff tracking
    received_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="received_payments"
    )

    # Verification
    is_verified = models.BooleanField(default=True)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_payments",
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-payment_date"]

    def __str__(self):
        return f"{self.booking.booking_id} - {self.get_payment_type_display()} - ${self.amount}"


class BookingCommunication(models.Model):
    """Track communications related to bookings"""

    COMMUNICATION_TYPES = [
        ("email", "Email"),
        ("sms", "SMS"),
        ("phone", "Phone Call"),
        ("whatsapp", "WhatsApp"),
        ("in_person", "In Person"),
        ("system", "System Generated"),
    ]

    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="communications"
    )
    communication_type = models.CharField(max_length=20, choices=COMMUNICATION_TYPES)
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    sent_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_communications"
    )
    sent_to = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="received_communications"
    )
    sent_at = models.DateTimeField(auto_now_add=True)
    is_internal = models.BooleanField(
        default=False, help_text="Internal communication between staff"
    )

    class Meta:
        ordering = ["-sent_at"]

    def __str__(self):
        return f"{self.booking.booking_id} - {self.get_communication_type_display()}: {self.subject}"


class BookingDocument(models.Model):
    """Documents related to bookings (contracts, receipts, etc.)"""

    DOCUMENT_TYPES = [
        ("contract", "Contract"),
        ("receipt", "Receipt"),
        ("invoice", "Invoice"),
        ("agreement", "Agreement"),
        ("permit", "Permit"),
        ("insurance", "Insurance"),
        ("layout", "Layout Plan"),
        ("other", "Other"),
    ]

    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="documents"
    )
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to="booking_documents/")
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_signed = models.BooleanField(default=False)
    signed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.booking.booking_id} - {self.title}"


class BookingReview(models.Model):
    """Customer reviews for completed bookings"""

    booking = models.OneToOneField(
        Booking, on_delete=models.CASCADE, related_name="review"
    )
    customer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="booking_reviews"
    )

    # Overall rating
    overall_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Overall rating from 1 to 5 stars",
    )

    # Specific ratings
    venue_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True
    )
    service_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True
    )
    food_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True
    )
    value_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True
    )

    # Review content
    title = models.CharField(max_length=200, blank=True)
    review = models.TextField()

    # Media
    images = models.TextField(blank=True, help_text="JSON array of image URLs")

    # Moderation
    is_approved = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)

    # Response from venue
    venue_response = models.TextField(blank=True)
    responded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="review_responses",
    )
    responded_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.booking.booking_id} - Review by {self.customer.get_full_name()} ({self.overall_rating}★)"


# Signals for automatic updates
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver


@receiver(post_save, sender=Booking)
def create_status_history(sender, instance, created, **kwargs):
    if created:
        BookingStatusHistory.objects.create(
            booking=instance,
            old_status="",
            new_status=instance.status,
            changed_by=instance.customer,
            reason="Booking created",
        )


@receiver(pre_save, sender=Booking)
def track_status_changes(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = Booking.objects.get(pk=instance.pk)
            if old_instance.status != instance.status:
                # Status change will be tracked in post_save
                if instance.status == "confirmed" and not instance.confirmed_at:
                    instance.confirmed_at = timezone.now()
                elif instance.status == "cancelled" and not instance.cancelled_at:
                    instance.cancelled_at = timezone.now()
                elif instance.status == "completed" and not instance.completed_at:
                    instance.completed_at = timezone.now()
        except Booking.DoesNotExist:
            pass
