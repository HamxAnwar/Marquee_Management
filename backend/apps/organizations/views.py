from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from apps.core.models import Organization, OrganizationMember, PlatformSettings
from apps.bookings.models import Booking
from .serializers import (
    OrganizationSerializer,
    OrganizationDetailSerializer,
    OrganizationRegistrationSerializer,
    OrganizationMemberSerializer,
    OrganizationStatsSerializer,
    PlatformSettingsSerializer,
)
from .permissions import IsOrganizationOwner, IsPlatformAdmin, IsOrganizationMember


class OrganizationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing organizations
    - Public can view active organizations (marketplace)
    - Authenticated users can register new organizations
    - Organization owners can manage their organizations
    - Platform admins can manage all organizations
    """

    serializer_class = OrganizationSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["status", "subscription_plan", "city", "country"]
    search_fields = ["name", "description", "city", "address"]
    ordering_fields = ["name", "created_at", "total_bookings"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """
        Return different querysets based on user permissions
        """
        user = self.request.user

        if not user.is_authenticated:
            # Anonymous users see only active organizations
            return Organization.objects.filter(status="active").annotate(
                total_bookings=Count("bookings"),
                total_halls=Count("halls", filter=Q(halls__is_active=True)),
            )

        if hasattr(user, "userprofile") and user.userprofile.is_platform_admin:
            # Platform admins see all organizations
            return Organization.objects.all().annotate(
                total_bookings=Count("bookings"),
                total_halls=Count("halls", filter=Q(halls__is_active=True)),
            )

        # Regular users see active organizations + their own organizations
        owned_orgs = user.owned_organizations.all()
        member_orgs = Organization.objects.filter(
            members__user=user, members__is_active=True
        )
        active_orgs = Organization.objects.filter(status="active")

        return (
            (owned_orgs.union(member_orgs).union(active_orgs))
            .annotate(
                total_bookings=Count("bookings"),
                total_halls=Count("halls", filter=Q(halls__is_active=True)),
            )
            .distinct()
        )

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == "create":
            return OrganizationRegistrationSerializer
        elif self.action in ["retrieve", "update", "partial_update"]:
            return OrganizationDetailSerializer
        return OrganizationSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == "list":
            permission_classes = [AllowAny]
        elif self.action == "create":
            permission_classes = [IsAuthenticated]
        elif self.action in ["retrieve"]:
            permission_classes = [AllowAny]
        elif self.action in ["update", "partial_update", "destroy"]:
            permission_classes = [
                IsAuthenticated,
                IsOrganizationOwner | IsPlatformAdmin,
            ]
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Set the owner to the current user when creating an organization"""
        organization = serializer.save(owner=self.request.user)

        # Update user profile to venue owner if not already
        profile = self.request.user.userprofile
        if profile.user_type == "customer":
            profile.user_type = "venue_owner"
            profile.save()

        # Create organization member record for the owner
        OrganizationMember.objects.create(
            organization=organization,
            user=self.request.user,
            role="admin",
            invited_by=self.request.user,
        )

    @action(detail=True, methods=["get"])
    def stats(self, request, pk=None):
        """Get detailed statistics for an organization"""
        organization = self.get_object()

        # Check permissions
        if not (
            request.user == organization.owner
            or request.user.userprofile.is_platform_admin
            or organization.members.filter(user=request.user, is_active=True).exists()
        ):
            return Response(
                {"error": "You do not have permission to view these statistics"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Calculate date ranges
        today = timezone.now().date()
        last_30_days = today - timedelta(days=30)
        last_7_days = today - timedelta(days=7)
        current_year = today.year
        current_month = today.month

        # Basic counts
        total_halls = organization.halls.filter(is_active=True).count()
        total_bookings = organization.bookings.count()
        active_bookings = organization.bookings.filter(
            status__in=["confirmed", "pending"]
        ).count()

        # Revenue calculations
        total_revenue = (
            organization.bookings.filter(status="completed").aggregate(
                Sum("total_amount")
            )["total_amount__sum"]
            or 0
        )

        monthly_revenue = (
            organization.bookings.filter(
                status="completed",
                event_date__year=current_year,
                event_date__month=current_month,
            ).aggregate(Sum("total_amount"))["total_amount__sum"]
            or 0
        )

        # Booking trends
        recent_bookings = organization.bookings.filter(
            created_at__gte=last_30_days
        ).count()

        weekly_bookings = organization.bookings.filter(
            created_at__gte=last_7_days
        ).count()

        # Average metrics
        avg_booking_value = (
            organization.bookings.filter(status="completed").aggregate(
                Avg("total_amount")
            )["total_amount__avg"]
            or 0
        )

        # Popular halls
        popular_halls = organization.halls.annotate(
            booking_count=Count("bookings")
        ).order_by("-booking_count")[:5]

        # Status distribution
        status_distribution = (
            organization.bookings.values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )

        # Monthly booking trends (last 12 months)
        monthly_trends = []
        for i in range(12):
            month_date = today.replace(day=1) - timedelta(days=30 * i)
            month_bookings = organization.bookings.filter(
                event_date__year=month_date.year, event_date__month=month_date.month
            ).count()
            monthly_trends.append(
                {"month": month_date.strftime("%Y-%m"), "bookings": month_bookings}
            )

        stats_data = {
            "organization": {
                "name": organization.name,
                "status": organization.status,
                "subscription_plan": organization.subscription_plan,
                "created_at": organization.created_at,
            },
            "totals": {
                "halls": total_halls,
                "bookings": total_bookings,
                "active_bookings": active_bookings,
                "total_revenue": float(total_revenue),
                "monthly_revenue": float(monthly_revenue),
                "avg_booking_value": float(avg_booking_value),
            },
            "trends": {
                "recent_bookings_30d": recent_bookings,
                "weekly_bookings": weekly_bookings,
                "monthly_trends": monthly_trends[:6],  # Last 6 months
            },
            "popular_halls": [
                {
                    "id": hall.id,
                    "name": hall.name,
                    "booking_count": hall.booking_count,
                    "capacity": hall.capacity,
                }
                for hall in popular_halls
            ],
            "status_distribution": list(status_distribution),
        }

        return Response(stats_data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """Approve a pending organization (Platform Admin only)"""
        organization = self.get_object()

        if organization.status != "pending":
            return Response(
                {"error": "Organization is not in pending status"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        organization.status = "active"
        organization.approved_at = timezone.now()
        organization.save()

        # TODO: Send approval notification email

        return Response(
            {
                "message": "Organization approved successfully",
                "status": organization.status,
            }
        )

    @action(detail=True, methods=["post"])
    def suspend(self, request, pk=None):
        """Suspend an organization (Platform Admin only)"""
        organization = self.get_object()
        reason = request.data.get("reason", "")

        if organization.status == "suspended":
            return Response(
                {"error": "Organization is already suspended"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        organization.status = "suspended"
        organization.save()

        # TODO: Send suspension notification email with reason

        return Response(
            {
                "message": "Organization suspended successfully",
                "status": organization.status,
                "reason": reason,
            }
        )

    @action(detail=True, methods=["get"])
    def members(self, request, pk=None):
        """Get organization members"""
        organization = self.get_object()
        members = organization.members.filter(is_active=True).select_related("user")
        serializer = OrganizationMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def invite_member(self, request, pk=None):
        """Invite a new member to the organization"""
        organization = self.get_object()

        email = request.data.get("email")
        role = request.data.get("role", "staff")

        if not email:
            return Response(
                {"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user exists
        from django.contrib.auth.models import User

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "User with this email does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if already a member
        if organization.members.filter(user=user).exists():
            return Response(
                {"error": "User is already a member of this organization"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create membership
        member = OrganizationMember.objects.create(
            organization=organization, user=user, role=role, invited_by=request.user
        )

        # TODO: Send invitation email

        serializer = OrganizationMemberSerializer(member)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"])
    def remove_member(self, request, pk=None):
        """Remove a member from the organization"""
        organization = self.get_object()
        user_id = request.data.get("user_id")

        if not user_id:
            return Response(
                {"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            member = organization.members.get(user_id=user_id, is_active=True)

            # Can't remove the owner
            if member.user == organization.owner:
                return Response(
                    {"error": "Cannot remove organization owner"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            member.is_active = False
            member.save()

            return Response({"message": "Member removed successfully"})

        except OrganizationMember.DoesNotExist:
            return Response(
                {"error": "Member not found"}, status=status.HTTP_404_NOT_FOUND
            )


class PlatformAdminViewSet(APIView):
    """
    Platform administration endpoints
    Only accessible by platform administrators
    """

    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get(self, request):
        """Get platform-wide statistics for software developer platform"""

        from django.contrib.auth import get_user_model
        User = get_user_model()

        # User/Developer statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        platform_admins = User.objects.filter(
            userprofile__user_type="platform_admin"
        ).count()
        venue_owners = User.objects.filter(
            userprofile__user_type="venue_owner"
        ).count()
        customers = User.objects.filter(
            userprofile__user_type="customer"
        ).count()

        # Organization statistics (now represents developer projects/companies)
        total_organizations = Organization.objects.count()
        active_organizations = Organization.objects.filter(status="active").count()
        pending_organizations = Organization.objects.filter(status="pending").count()
        suspended_organizations = Organization.objects.filter(
            status="suspended"
        ).count()

        # System health metrics
        recent_registrations = User.objects.filter(
            date_joined__gte=timezone.now() - timedelta(days=7)
        ).count()

        # API usage (simplified - would need actual API logging)
        api_calls_today = 0  # Placeholder - would need API logging system

        # Top organizations by user count (representing most active projects)
        top_organizations = Organization.objects.annotate(
            user_count=Count("members")
        ).order_by("-user_count")[:10]

        # Recent activities
        recent_users = User.objects.filter(
            date_joined__gte=timezone.now() - timedelta(days=7)
        ).order_by("-date_joined")[:5]

        recent_organizations = Organization.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        ).order_by("-created_at")[:5]

        stats = {
            "users": {
                "total": total_users,
                "active": active_users,
                "platform_admins": platform_admins,
                "venue_owners": venue_owners,
                "customers": customers,
            },
            "organizations": {
                "total": total_organizations,
                "active": active_organizations,
                "pending": pending_organizations,
                "suspended": suspended_organizations,
            },
            "system_health": {
                "recent_registrations": recent_registrations,
                "api_calls_today": api_calls_today,
            },
            "top_organizations": [
                {
                    "id": org.id,
                    "name": org.name,
                    "user_count": org.user_count,
                    "status": org.status,
                    "subscription_plan": org.subscription_plan,
                }
                for org in top_organizations
            ],
            "recent_activities": {
                "users": [
                    {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "user_type": getattr(user.userprofile, 'user_type', 'unknown'),
                        "created_at": user.date_joined,
                    }
                    for user in recent_users
                ],
                "organizations": [
                    {
                        "id": org.id,
                        "name": org.name,
                        "status": org.status,
                        "created_at": org.created_at,
                    }
                    for org in recent_organizations
                ],
            },
        }

        return Response(stats)

class PlatformSettingsView(APIView):
    """
    Platform settings management
    Only accessible by platform administrators
    """

    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get(self, request):
        """Get platform settings"""
        settings, created = PlatformSettings.objects.get_or_create()
        serializer = PlatformSettingsSerializer(settings)
        return Response(serializer.data)

    def patch(self, request):
        """Update platform settings"""
        settings, created = PlatformSettings.objects.get_or_create()
        serializer = PlatformSettingsSerializer(
            settings, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def pending_approvals(self, request):
        """Get organizations pending approval"""

        pending_orgs = Organization.objects.filter(status="pending").order_by(
            "created_at"
        )
        serializer = OrganizationSerializer(pending_orgs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def bulk_approve(self, request):
        """Bulk approve multiple organizations"""

        org_ids = request.data.get("organization_ids", [])

        if not org_ids:
            return Response(
                {"error": "organization_ids list is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated_count = Organization.objects.filter(
            id__in=org_ids, status="pending"
        ).update(status="active", approved_at=timezone.now())

        # TODO: Send approval emails to all approved organizations

        return Response(
            {
                "message": f"{updated_count} organizations approved successfully",
                "approved_count": updated_count,
            }
        )

    @action(detail=False, methods=["post"])
    def bulk_suspend(self, request):
        """Bulk suspend multiple organizations"""

        org_ids = request.data.get("organization_ids", [])
        reason = request.data.get("reason", "Administrative action")

        if not org_ids:
            return Response(
                {"error": "organization_ids list is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated_count = Organization.objects.filter(
            id__in=org_ids, status="active"
        ).update(status="suspended")

        # TODO: Send suspension emails to all suspended organizations

        return Response(
            {
                "message": f"{updated_count} organizations suspended successfully",
                "suspended_count": updated_count,
                "reason": reason,
            }
        )


# Marketplace public endpoints
class MarketplaceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public marketplace endpoints for customers to browse organizations and venues
    """

    serializer_class = OrganizationSerializer
    permission_classes = [AllowAny]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["city", "subscription_plan"]
    search_fields = ["name", "description", "city"]
    ordering_fields = ["name", "total_bookings", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        """Return only active organizations with their halls and stats"""
        return (
            Organization.objects.filter(status="active")
            .annotate(
                total_bookings=Count("bookings"),
                total_halls=Count("halls", filter=Q(halls__is_active=True)),
                avg_rating=Avg(
                    "halls__reviews__rating", filter=Q(halls__reviews__is_approved=True)
                ),
            )
            .prefetch_related("halls")
        )

    @action(detail=True, methods=["get"])
    def halls(self, request, pk=None):
        """Get active halls for an organization"""
        organization = self.get_object()
        halls = organization.halls.filter(is_active=True).annotate(
            rating=Avg("reviews__rating", filter=Q(reviews__is_approved=True)),
            review_count=Count("reviews", filter=Q(reviews__is_approved=True)),
        )

        from apps.core.serializers import HallSerializer

        serializer = HallSerializer(halls, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def menu(self, request, pk=None):
        """Get menu categories and items for an organization"""
        organization = self.get_object()
        categories = organization.menu_categories.filter(
            is_active=True
        ).prefetch_related("items__variants")

        from apps.menu.serializers import MenuCategorySerializer

        serializer = MenuCategorySerializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def packages(self, request, pk=None):
        """Get menu packages for an organization"""
        organization = self.get_object()
        packages = organization.menu_packages.filter(is_active=True)

        from apps.menu.serializers import MenuPackageSerializer

        serializer = MenuPackageSerializer(packages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def bookings(self, request, pk=None):
        """Get bookings for an organization (for venue owners/managers)"""
        organization = self.get_object()

        # Check permissions - only organization owners/managers can access
        from .permissions import IsOrganizationAdminOrManager
        permission = IsOrganizationAdminOrManager()
        if not permission.has_object_permission(request, self, organization):
            return Response(
                {"error": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )

        bookings = organization.bookings.select_related(
            'customer', 'hall'
        ).prefetch_related('menu_items')

        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            bookings = bookings.filter(status=status_filter)

        hall_filter = request.query_params.get('hall')
        if hall_filter:
            bookings = bookings.filter(hall_id=hall_filter)

        # Date filters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            bookings = bookings.filter(event_date__gte=start_date)
        if end_date:
            bookings = bookings.filter(event_date__lte=end_date)

        # Search
        search = request.query_params.get('search')
        if search:
            bookings = bookings.filter(
                Q(booking_id__icontains=search) |
                Q(customer__first_name__icontains=search) |
                Q(customer__last_name__icontains=search)
            )

        bookings = bookings.order_by('-created_at')

        from apps.bookings.serializers import BookingListSerializer
        serializer = BookingListSerializer(bookings, many=True)
        return Response(serializer.data)
