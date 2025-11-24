from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for organization viewsets
router = DefaultRouter()
router.register(r"", views.OrganizationViewSet, basename="organizations")

# Marketplace router
marketplace_router = DefaultRouter()
marketplace_router.register(r"", views.MarketplaceViewSet, basename="marketplace")

urlpatterns = [
    # Platform admin routes
    path("admin/", views.PlatformAdminViewSet.as_view(), name="platform-admin"),
    path(
        "admin/settings/",
        views.PlatformSettingsView.as_view(),
        name="platform-settings",
    ),
    # Organization management routes
    path("", include(router.urls)),
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
    path(
        "<int:pk>/bookings/",
        views.OrganizationViewSet.as_view({"get": "bookings"}),
        name="organization-bookings",
    ),
]
