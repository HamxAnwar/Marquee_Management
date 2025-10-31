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
                    "login": "/api/auth/login/",
                    "register": "/api/auth/register/",
                    "user": "/api/auth/user/",
                    "logout": "/api/auth/logout/",
                },
                "core": "/api/core/",
                "menu": "/api/menu/",
                "bookings": "/api/bookings/",
                "pricing": "/api/pricing/",
                "organizations": "/api/organizations/",
                "marketplace": "/api/marketplace/",
                "admin": "/api/admin/",
            },
        }
    )


urlpatterns = [
    # Root API endpoint
    path("", api_root, name="api_root"),
    path("admin/", admin.site.urls),
    # JWT Authentication endpoints
    path(
        "api/auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"
    ),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/user/", current_user, name="current_user"),
    path("api/auth/register/", register, name="register"),
    path("api/auth/logout/", logout, name="logout"),
    path("api/auth/change-password/", change_password, name="change_password"),
    # API endpoints with proper namespacing
    path("api/core/", include("apps.core.urls")),
    path("api/menu/", include("apps.menu.urls")),
    path("api/bookings/", include("apps.bookings.urls")),
    path("api/pricing/", include("apps.pricing.urls")),
    path("api/organizations/", include("apps.organizations.urls")),
    # Direct marketplace endpoint for frontend compatibility
    path("api/marketplace/", include("apps.organizations.marketplace_urls")),
    # DRF auth endpoints
    path("api-auth/", include("rest_framework.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
