from rest_framework.permissions import BasePermission
from apps.core.models import Organization, OrganizationMember


class IsOrganizationOwner(BasePermission):
    """
    Permission to check if user is the owner of the organization
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Organization):
            return obj.owner == request.user

        # If obj has organization attribute (like Hall, MenuItem, etc.)
        if hasattr(obj, "organization"):
            return obj.organization.owner == request.user

        return False


class IsOrganizationMember(BasePermission):
    """
    Permission to check if user is a member of the organization
    """

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        if isinstance(obj, Organization):
            return obj.members.filter(user=request.user, is_active=True).exists()

        # If obj has organization attribute
        if hasattr(obj, "organization"):
            return obj.organization.members.filter(
                user=request.user, is_active=True
            ).exists()

        return False


class IsOrganizationAdminOrManager(BasePermission):
    """
    Permission to check if user is admin or manager of the organization
    """

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        organization = None
        if isinstance(obj, Organization):
            organization = obj
        elif hasattr(obj, "organization"):
            organization = obj.organization
        else:
            return False

        # Check if user is owner
        if organization.owner == request.user:
            return True

        # Check if user is admin or manager
        member = organization.members.filter(user=request.user, is_active=True).first()
        if member:
            return member.role in ["admin", "manager"]

        return False


class IsPlatformAdmin(BasePermission):
    """
    Permission to check if user is a platform administrator
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        # Check if user has platform admin profile
        try:
            profile = request.user.userprofile
            return profile.is_platform_admin
        except:
            return False

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsVenueOwner(BasePermission):
    """
    Permission to check if user is a venue owner (has organizations)
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        try:
            profile = request.user.userprofile
            return profile.is_venue_owner and request.user.owned_organizations.exists()
        except:
            return False


class CanManageOrganization(BasePermission):
    """
    Combined permission for organization management
    Allows platform admins, organization owners, and admin/manager members
    """

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        # Platform admin can manage all organizations
        try:
            if request.user.userprofile.is_platform_admin:
                return True
        except:
            pass

        organization = None
        if isinstance(obj, Organization):
            organization = obj
        elif hasattr(obj, "organization"):
            organization = obj.organization
        else:
            return False

        # Organization owner can manage
        if organization.owner == request.user:
            return True

        # Admin/Manager members can manage
        member = organization.members.filter(user=request.user, is_active=True).first()
        if member and member.role in ["admin", "manager"]:
            return True

        return False


class CanViewOrganization(BasePermission):
    """
    Permission for viewing organization data
    More permissive than management permissions
    """

    def has_object_permission(self, request, view, obj):
        # Public can view active organizations
        if isinstance(obj, Organization) and obj.status == "active":
            return True

        if not request.user.is_authenticated:
            return False

        # Platform admin can view all
        try:
            if request.user.userprofile.is_platform_admin:
                return True
        except:
            pass

        organization = None
        if isinstance(obj, Organization):
            organization = obj
        elif hasattr(obj, "organization"):
            organization = obj.organization
        else:
            return False

        # Organization members can view
        if (
            organization.owner == request.user
            or organization.members.filter(user=request.user, is_active=True).exists()
        ):
            return True

        return False


class CanCreateBooking(BasePermission):
    """
    Permission to create bookings
    """

    def has_permission(self, request, view):
        # Must be authenticated to create bookings
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Check if organization is active and accepts bookings
        if hasattr(obj, "organization"):
            return obj.organization.status == "active"
        return True


class CanManageBookings(BasePermission):
    """
    Permission to manage bookings for an organization
    """

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        # Platform admin can manage all bookings
        try:
            if request.user.userprofile.is_platform_admin:
                return True
        except:
            pass

        # Customers can manage their own bookings
        if hasattr(obj, "customer") and obj.customer == request.user:
            return True

        # Organization members can manage organization bookings
        if hasattr(obj, "organization"):
            organization = obj.organization

            # Owner can manage
            if organization.owner == request.user:
                return True

            # Active members with appropriate roles can manage
            member = organization.members.filter(
                user=request.user, is_active=True
            ).first()
            if member and member.role in ["admin", "manager", "staff"]:
                return True

        return False


class IsActiveOrganization(BasePermission):
    """
    Permission to ensure organization is active
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Organization):
            return obj.status == "active"
        elif hasattr(obj, "organization"):
            return obj.organization.status == "active"
        return True


class CanAccessAnalytics(BasePermission):
    """
    Permission to access analytics and statistics
    """

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        # Platform admin can access all analytics
        try:
            if request.user.userprofile.is_platform_admin:
                return True
        except:
            pass

        organization = None
        if isinstance(obj, Organization):
            organization = obj
        elif hasattr(obj, "organization"):
            organization = obj.organization
        else:
            return False

        # Organization owner and admin/manager members can access analytics
        if organization.owner == request.user:
            return True

        member = organization.members.filter(user=request.user, is_active=True).first()
        if member and member.role in ["admin", "manager"]:
            return True

        return False


class HasValidSubscription(BasePermission):
    """
    Permission to check if organization has valid subscription for certain features
    """

    def has_object_permission(self, request, view, obj):
        organization = None
        if isinstance(obj, Organization):
            organization = obj
        elif hasattr(obj, "organization"):
            organization = obj.organization
        else:
            return True  # If no organization context, allow

        # For now, all subscription plans are valid
        # This can be extended to check subscription limits, expiry, etc.
        return organization.status == "active"


class CanInviteMembers(BasePermission):
    """
    Permission to invite members to organization
    """

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        organization = None
        if isinstance(obj, Organization):
            organization = obj
        elif hasattr(obj, "organization"):
            organization = obj.organization
        else:
            return False

        # Only owner and admin can invite members
        if organization.owner == request.user:
            return True

        member = organization.members.filter(user=request.user, is_active=True).first()
        if member and member.role == "admin":
            return True

        return False


class CanManageMembers(BasePermission):
    """
    Permission to manage organization members
    """

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        organization = None
        if isinstance(obj, OrganizationMember):
            organization = obj.organization
        elif isinstance(obj, Organization):
            organization = obj
        elif hasattr(obj, "organization"):
            organization = obj.organization
        else:
            return False

        # Platform admin can manage all members
        try:
            if request.user.userprofile.is_platform_admin:
                return True
        except:
            pass

        # Owner can manage all members
        if organization.owner == request.user:
            return True

        # Admin members can manage other members (except owner)
        member = organization.members.filter(user=request.user, is_active=True).first()
        if member and member.role == "admin":
            # Cannot manage the owner
            if isinstance(obj, OrganizationMember) and obj.user == organization.owner:
                return False
            return True

        return False
