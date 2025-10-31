from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for organization viewsets
router = DefaultRouter()
router.register(r"", views.OrganizationViewSet, basename="organizations")

# Platform admin router
admin_router = DefaultRouter()
admin_router.register(r"", views.PlatformAdminViewSet, basename="platform-admin")

# Marketplace router
marketplace_router = DefaultRouter()
marketplace_router.register(r"", views.MarketplaceViewSet, basename="marketplace")

urlpatterns = [
    # Organization management routes
    path("", include(router.urls)),
    # Platform admin routes
    path("admin/", include(admin_router.urls)),
    path(
        "admin/settings/",
        views.PlatformAdminViewSet.as_view({"get": "settings", "patch": "settings"}),
        name="platform-settings",
    ),
    path(
        "admin/pending-approvals/",
        views.PlatformAdminViewSet.as_view({"get": "pending_approvals"}),
        name="platform-pending-approvals",
    ),
    path(
        "admin/bulk-approve/",
        views.PlatformAdminViewSet.as_view({"post": "bulk_approve"}),
        name="platform-bulk-approve",
    ),
    path(
        "admin/bulk-suspend/",
        views.PlatformAdminViewSet.as_view({"post": "bulk_suspend"}),
        name="platform-bulk-suspend",
    ),
    # Marketplace routes
    path("marketplace/", include(marketplace_router.urls)),
    path(
        "marketplace/<int:pk>/halls/",
        views.MarketplaceViewSet.as_view({"get": "halls"}),
        name="marketplace-halls",
    ),
    path(
        "marketplace/<int:pk>/menu/",
        views.MarketplaceViewSet.as_view({"get": "menu"}),
        name="marketplace-menu",
    ),
    path(
        "marketplace/<int:pk>/packages/",
        views.MarketplaceViewSet.as_view({"get": "packages"}),
        name="marketplace-packages",
    ),
    # Organization-specific action endpoints
    path(
        "<int:pk>/approve/",
        views.OrganizationViewSet.as_view({"post": "approve"}),
        name="organization-approve",
    ),
    path(
        "<int:pk>/suspend/",
        views.OrganizationViewSet.as_view({"post": "suspend"}),
        name="organization-suspend",
    ),
    path(
        "<int:pk>/members/",
        views.OrganizationViewSet.as_view({"get": "members"}),
        name="organization-members",
    ),
    path(
        "<int:pk>/invite-member/",
        views.OrganizationViewSet.as_view({"post": "invite_member"}),
        name="organization-invite-member",
    ),
    path(
        "<int:pk>/remove-member/",
        views.OrganizationViewSet.as_view({"delete": "remove_member"}),
        name="organization-remove-member",
    ),
    path(
        "<int:pk>/stats/",
        views.OrganizationViewSet.as_view({"get": "stats"}),
        name="organization-stats",
    ),
]
