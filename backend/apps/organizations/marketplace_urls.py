from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for marketplace viewset
marketplace_router = DefaultRouter()
marketplace_router.register(r"", views.MarketplaceViewSet, basename="marketplace")

urlpatterns = [
    # Main marketplace routes (list/detail of venues)
    path("", include(marketplace_router.urls)),
    # Venue-specific marketplace endpoints
    path(
        "<int:pk>/halls/",
        views.MarketplaceViewSet.as_view({"get": "halls"}),
        name="marketplace-halls",
    ),
    path(
        "<int:pk>/menu/",
        views.MarketplaceViewSet.as_view({"get": "menu"}),
        name="marketplace-menu",
    ),
    path(
        "<int:pk>/packages/",
        views.MarketplaceViewSet.as_view({"get": "packages"}),
        name="marketplace-packages",
    ),
    path(
        "<int:pk>/reviews/",
        views.MarketplaceViewSet.as_view({"get": "reviews"}),
        name="marketplace-reviews",
    ),
    path(
        "<int:pk>/availability/",
        views.MarketplaceViewSet.as_view({"get": "availability"}),
        name="marketplace-availability",
    ),
]
