"""
URL configuration for marquee_system project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework.documentation import include_docs_urls
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.core.auth_views import (
    CustomTokenObtainPairView,
    current_user,
    register,
    logout,
    change_password,
)


# API root endpoint
@api_view(["GET"])
def api_root(request):
    return Response(
        {
            "message": "Marquee Management API",
            "version": "1.0",
            "endpoints": {
                "auth": {
                    "login": "/api/v1/auth/login/",
                    "register": "/api/v1/auth/register/",
                    "user": "/api/v1/auth/user/",
                    "logout": "/api/v1/auth/logout/",
                },
                "core": "/api/v1/core/",
                "menu": "/api/v1/menu/",
                "bookings": "/api/v1/bookings/",
                "pricing": "/api/v1/pricing/",
                "organizations": "/api/v1/organizations/",
                "marketplace": "/api/v1/marketplace/",
                "admin": "/api/v1/admin/",
            },
        }
    )


urlpatterns = [
    # Root API endpoint
    path("", api_root, name="api_root"),
    path("admin/", admin.site.urls),
    # JWT Authentication endpoints
    path(
        "api/v1/auth/login", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"
    ),
    path("api/v1/auth/token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/v1/auth/user", current_user, name="current_user"),
    path("api/v1/auth/register", register, name="register"),
    path("api/v1/auth/logout", logout, name="logout"),
    path("api/v1/auth/change-password", change_password, name="change_password"),
    # API endpoints with proper namespacing
    path("api/v1/core/", include("apps.core.urls")),
    path("api/v1/menu/", include("apps.menu.urls")),
     path("api/v1/bookings", include("apps.bookings.urls")),
    path("api/v1/pricing/", include("apps.pricing.urls")),
    path("api/v1/organizations/", include("apps.organizations.urls")),
    # Direct marketplace endpoint for frontend compatibility
    path("api/v1/marketplace/", include("apps.organizations.marketplace_urls")),
    # DRF auth endpoints
    path("api-auth/", include("rest_framework.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
