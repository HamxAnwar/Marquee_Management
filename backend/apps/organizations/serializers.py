from rest_framework import serializers
from django.contrib.auth.models import User
from apps.core.models import (
    Organization,
    OrganizationMember,
    UserProfile,
    PlatformSettings,
)


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user information for nested serialization"""

    full_name = serializers.CharField(source="get_full_name", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "full_name"]
        read_only_fields = ["id", "username", "full_name"]


class OrganizationSerializer(serializers.ModelSerializer):
    """Basic organization serializer for list views"""

    owner = UserBasicSerializer(read_only=True)
    total_halls = serializers.IntegerField(read_only=True)
    total_bookings = serializers.IntegerField(read_only=True)
    avg_rating = serializers.DecimalField(
        max_digits=3, decimal_places=2, read_only=True
    )

    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "email",
            "phone",
            "city",
            "state",
            "country",
            "website",
            "logo",
            "cover_image",
            "subscription_plan",
            "status",
            "owner",
            "total_halls",
            "total_bookings",
            "avg_rating",
            "created_at",
        ]
        read_only_fields = ["id", "slug", "owner", "status", "created_at"]


class OrganizationDetailSerializer(serializers.ModelSerializer):
    """Detailed organization serializer for single organization views"""

    owner = UserBasicSerializer(read_only=True)
    total_halls = serializers.IntegerField(read_only=True)
    total_bookings = serializers.IntegerField(read_only=True)
    member_count = serializers.SerializerMethodField()
    recent_bookings = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "email",
            "phone",
            "address",
            "city",
            "state",
            "postal_code",
            "country",
            "business_license",
            "tax_id",
            "website",
            "logo",
            "cover_image",
            "subscription_plan",
            "status",
            "commission_rate",
            "owner",
            "total_halls",
            "total_bookings",
            "member_count",
            "recent_bookings",
            "created_at",
            "updated_at",
            "approved_at",
        ]
        read_only_fields = [
            "id",
            "slug",
            "owner",
            "status",
            "commission_rate",
            "total_halls",
            "total_bookings",
            "member_count",
            "recent_bookings",
            "created_at",
            "updated_at",
            "approved_at",
        ]

    def get_member_count(self, obj):
        return obj.members.filter(is_active=True).count()

    def get_recent_bookings(self, obj):
        recent_bookings = obj.bookings.order_by("-created_at")[:5]
        return [
            {
                "booking_id": booking.booking_id,
                "customer_name": booking.customer.get_full_name(),
                "event_date": booking.event_date,
                "status": booking.status,
                "total_amount": booking.total_amount,
            }
            for booking in recent_bookings
        ]


class OrganizationRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for organization registration"""

    terms_accepted = serializers.BooleanField(write_only=True, required=True)

    class Meta:
        model = Organization
        fields = [
            "name",
            "description",
            "email",
            "phone",
            "address",
            "city",
            "state",
            "postal_code",
            "country",
            "business_license",
            "tax_id",
            "website",
            "logo",
            "cover_image",
            "terms_accepted",
        ]

    def validate_terms_accepted(self, value):
        if not value:
            raise serializers.ValidationError(
                "You must accept the terms and conditions"
            )
        return value

    def validate_email(self, value):
        # Check if email is already used by another organization
        if Organization.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An organization with this email already exists"
            )
        return value

    def validate_name(self, value):
        # Check if name is already taken
        if Organization.objects.filter(name=value).exists():
            raise serializers.ValidationError(
                "An organization with this name already exists"
            )
        return value

    def create(self, validated_data):
        # Remove terms_accepted from validated_data as it's not a model field
        validated_data.pop("terms_accepted", None)

        # Set default status to pending for manual approval
        validated_data["status"] = "pending"

        return super().create(validated_data)


class OrganizationMemberSerializer(serializers.ModelSerializer):
    """Serializer for organization members"""

    user = UserBasicSerializer(read_only=True)
    invited_by = UserBasicSerializer(read_only=True)
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = OrganizationMember
        fields = [
            "id",
            "user",
            "role",
            "role_display",
            "is_active",
            "invited_by",
            "joined_at",
        ]
        read_only_fields = ["id", "user", "invited_by", "joined_at"]


class OrganizationStatsSerializer(serializers.Serializer):
    """Serializer for organization statistics"""

    organization = serializers.DictField()
    totals = serializers.DictField()
    trends = serializers.DictField()
    popular_halls = serializers.ListField()
    status_distribution = serializers.ListField()


class PlatformSettingsSerializer(serializers.ModelSerializer):
    """Serializer for platform settings"""

    class Meta:
        model = PlatformSettings
        fields = [
            "id",
            "default_commission_rate",
            "auto_approve_organizations",
            "platform_fee_percentage",
            "support_email",
            "no_reply_email",
            "maintenance_mode",
            "maintenance_message",
            "site_title",
            "site_description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class OrganizationInviteSerializer(serializers.Serializer):
    """Serializer for inviting members to organization"""

    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=OrganizationMember.ROLE_CHOICES, default="staff"
    )
    message = serializers.CharField(max_length=500, required=False)

    def validate_email(self, value):
        # Check if user with this email exists
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist")
        return value


class OrganizationApprovalSerializer(serializers.Serializer):
    """Serializer for organization approval/rejection"""

    action = serializers.ChoiceField(choices=["approve", "reject"])
    reason = serializers.CharField(max_length=1000, required=False)
    send_notification = serializers.BooleanField(default=True)


class MarketplaceOrganizationSerializer(serializers.ModelSerializer):
    """Public marketplace serializer for organizations"""

    total_halls = serializers.IntegerField(read_only=True)
    avg_rating = serializers.DecimalField(
        max_digits=3, decimal_places=2, read_only=True
    )
    featured_halls = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "city",
            "state",
            "country",
            "website",
            "logo",
            "cover_image",
            "total_halls",
            "avg_rating",
            "featured_halls",
        ]

    def get_featured_halls(self, obj):
        featured_halls = obj.halls.filter(is_active=True).order_by("-id")[:3]
        return [
            {
                "id": hall.id,
                "name": hall.name,
                "capacity": hall.capacity,
                "base_price": hall.base_price,
                "featured_image": hall.featured_image.url
                if hall.featured_image
                else None,
            }
            for hall in featured_halls
        ]


class PlatformStatsSerializer(serializers.Serializer):
    """Serializer for platform-wide statistics"""

    organizations = serializers.DictField()
    bookings = serializers.DictField()
    revenue = serializers.DictField()
    top_organizations = serializers.ListField()
    recent_activities = serializers.DictField()


class BulkActionSerializer(serializers.Serializer):
    """Serializer for bulk actions on organizations"""

    organization_ids = serializers.ListField(
        child=serializers.IntegerField(), min_length=1, max_length=100
    )
    action = serializers.ChoiceField(choices=["approve", "suspend", "activate"])
    reason = serializers.CharField(max_length=1000, required=False)


class OrganizationSearchSerializer(serializers.Serializer):
    """Serializer for organization search parameters"""

    q = serializers.CharField(required=False)
    city = serializers.CharField(required=False)
    state = serializers.CharField(required=False)
    country = serializers.CharField(required=False)
    subscription_plan = serializers.CharField(required=False)
    min_capacity = serializers.IntegerField(required=False, min_value=1)
    max_capacity = serializers.IntegerField(required=False, min_value=1)
    min_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, min_value=0
    )
    max_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, min_value=0
    )
    event_type = serializers.CharField(required=False)
    amenities = serializers.ListField(child=serializers.CharField(), required=False)
    has_parking = serializers.BooleanField(required=False)
    has_ac = serializers.BooleanField(required=False)
    has_kitchen = serializers.BooleanField(required=False)


class OrganizationContactSerializer(serializers.Serializer):
    """Serializer for contacting organizations"""

    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False)
    subject = serializers.CharField(max_length=200)
    message = serializers.CharField(max_length=2000)
    event_date = serializers.DateField(required=False)
    guest_count = serializers.IntegerField(required=False, min_value=1)
    event_type = serializers.CharField(max_length=50, required=False)


class OrganizationReviewSerializer(serializers.Serializer):
    """Serializer for organization reviews/ratings"""

    rating = serializers.IntegerField(min_value=1, max_value=5)
    title = serializers.CharField(max_length=200, required=False)
    review = serializers.CharField(max_length=2000)
    service_rating = serializers.IntegerField(min_value=1, max_value=5, required=False)
    venue_rating = serializers.IntegerField(min_value=1, max_value=5, required=False)
    value_rating = serializers.IntegerField(min_value=1, max_value=5, required=False)
    recommend = serializers.BooleanField(default=True)
