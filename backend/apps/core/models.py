from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
import uuid


class Organization(models.Model):
    """Model representing a venue/hall organization (tenant)"""

    SUBSCRIPTION_PLANS = [
        ("basic", "Basic"),
        ("premium", "Premium"),
        ("enterprise", "Enterprise"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending Approval"),
        ("active", "Active"),
        ("suspended", "Suspended"),
        ("cancelled", "Cancelled"),
    ]

    # Basic Information
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    description = models.TextField(blank=True)

    # Contact Information
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default="Pakistan")

    # Business Information
    business_license = models.CharField(max_length=100, blank=True)
    tax_id = models.CharField(max_length=50, blank=True)
    website = models.URLField(blank=True)

    # Platform Settings
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="owned_organizations"
    )
    subscription_plan = models.CharField(
        max_length=20, choices=SUBSCRIPTION_PLANS, default="basic"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    commission_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5.00,
        help_text="Platform commission percentage",
    )

    # Media
    logo = models.ImageField(upload_to="organizations/logos/", blank=True, null=True)
    cover_image = models.ImageField(
        upload_to="organizations/covers/", blank=True, null=True
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        return self.status == "active"

    # total_halls and total_bookings are now provided via queryset annotations in views
    # to avoid conflicts with the annotated fields


class OrganizationMember(models.Model):
    """Staff members of an organization"""

    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("manager", "Manager"),
        ("staff", "Staff"),
        ("viewer", "Viewer"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="members"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="organization_memberships"
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="staff")
    is_active = models.BooleanField(default=True)
    invited_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invited_members",
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["organization", "user"]
        ordering = ["-joined_at"]

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.organization.name} ({self.role})"


class Hall(models.Model):
    """Model representing a hall/marquee venue within an organization"""

    HALL_TYPES = [
        ("indoor", "Indoor Hall"),
        ("outdoor", "Outdoor Hall"),
        ("garden", "Garden"),
        ("rooftop", "Rooftop"),
        ("banquet", "Banquet Hall"),
        ("conference", "Conference Room"),
    ]

    # Organization relationship (multi-tenancy)
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="halls"
    )

    # Basic Information
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=150, blank=True)
    description = models.TextField(blank=True)
    hall_type = models.CharField(max_length=20, choices=HALL_TYPES, default="indoor")

    # Capacity and Pricing
    capacity = models.IntegerField(
        validators=[MinValueValidator(1)], help_text="Maximum number of guests"
    )
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Base price for hall rental",
    )

    # Features and Amenities
    amenities = models.TextField(
        blank=True, help_text="Comma-separated list of amenities"
    )
    has_parking = models.BooleanField(default=False)
    has_ac = models.BooleanField(default=False)
    has_kitchen = models.BooleanField(default=False)
    has_sound_system = models.BooleanField(default=False)
    has_stage = models.BooleanField(default=False)

    # Media
    featured_image = models.ImageField(
        upload_to="halls/featured/", blank=True, null=True
    )

    # Settings
    is_active = models.BooleanField(default=True)
    allow_external_catering = models.BooleanField(default=False)
    advance_booking_days = models.IntegerField(
        default=30, help_text="Minimum days before event for booking"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["organization", "name"]
        unique_together = ["organization", "slug"]

    def __str__(self):
        return f"{self.organization.name} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def amenities_list(self):
        return [
            amenity.strip() for amenity in self.amenities.split(",") if amenity.strip()
        ]

    # rating and total_bookings are now provided via queryset annotations in views
    # to avoid conflicts with the annotated fields


class HallImage(models.Model):
    """Additional images for halls"""

    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="halls/gallery/")
    caption = models.CharField(max_length=200, blank=True)
    is_featured = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["display_order", "-uploaded_at"]

    def __str__(self):
        return f"{self.hall.name} - Image {self.id}"


class HallReview(models.Model):
    """Customer reviews for halls"""

    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name="reviews")
    customer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="hall_reviews"
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars",
    )
    title = models.CharField(max_length=200)
    review = models.TextField()
    is_approved = models.BooleanField(default=False)
    is_verified_booking = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ["hall", "customer"]

    def __str__(self):
        return f"{self.hall.name} - {self.customer.get_full_name()} ({self.rating}★)"


class DiscountTier(models.Model):
    """Guest-based discount tiers for an organization"""

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="discount_tiers"
    )
    name = models.CharField(max_length=50)
    min_guests = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Minimum number of guests for this tier",
    )
    max_guests = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Maximum number of guests for this tier (inclusive)",
    )
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Discount percentage (0-100)",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["organization", "min_guests"]
        unique_together = ["organization", "name"]

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.max_guests <= self.min_guests:
            raise ValidationError("Max guests must be greater than min guests")

    def __str__(self):
        return f"{self.organization.name} - {self.name} ({self.min_guests}-{self.max_guests} guests, {self.discount_percentage}% off)"


class UserProfile(models.Model):
    """Extended user profile for customers and venue owners"""

    USER_TYPES = [
        ("customer", "Customer"),
        ("venue_owner", "Venue Owner"),
        ("platform_admin", "Platform Admin"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default="customer")
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    preferred_contact = models.CharField(
        max_length=10,
        choices=[("phone", "Phone"), ("email", "Email"), ("both", "Both")],
        default="phone",
    )
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    # Preferences for customers
    preferred_event_types = models.TextField(
        blank=True, help_text="Comma-separated event types"
    )
    budget_range_min = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    budget_range_max = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    # Email preferences
    email_notifications = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.get_user_type_display()})"

    @property
    def is_venue_owner(self):
        return self.user_type == "venue_owner"

    @property
    def is_platform_admin(self):
        return self.user_type == "platform_admin"

    @property
    def owned_organizations(self):
        if self.is_venue_owner:
            return self.user.owned_organizations.all()
        return Organization.objects.none()


class PlatformSettings(models.Model):
    """Platform-wide settings for software developer company"""

    # Platform Information
    platform_name = models.CharField(
        max_length=100, default="Developer Platform"
    )
    platform_email = models.EmailField(default="admin@developerplatform.com")
    platform_phone = models.CharField(max_length=20, blank=True)

    # Support Settings
    support_email = models.EmailField(default="support@developerplatform.com")

    # System Settings
    maintenance_mode = models.BooleanField(default=False)
    maintenance_message = models.TextField(blank=True)

    # API Settings
    api_rate_limit = models.IntegerField(default=1000)

    # User Management
    allow_user_registration = models.BooleanField(default=True)
    require_email_verification = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Platform Settings"
        verbose_name_plural = "Platform Settings"

    def __str__(self):
        return f"Platform Settings (Updated: {self.updated_at.date()})"

    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        if not self.pk and PlatformSettings.objects.exists():
            raise ValueError("Only one PlatformSettings instance is allowed")
        super().save(*args, **kwargs)


# Signal to create UserProfile automatically
from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        instance.userprofile.save()
    except UserProfile.DoesNotExist:
        UserProfile.objects.create(user=instance)
