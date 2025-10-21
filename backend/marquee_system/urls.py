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
from apps.core.auth_views import (
    CustomTokenObtainPairView, 
    current_user, 
    register, 
    logout, 
    change_password
)

# Main API router
api_router = DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # JWT Authentication endpoints
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/user/', current_user, name='current_user'),
    path('api/auth/register/', register, name='register'),
    path('api/auth/logout/', logout, name='logout'),
    path('api/auth/change-password/', change_password, name='change_password'),
    
    # API endpoints
    path('api/', include('apps.core.urls')),  # This includes /api/halls/, /api/users/ etc.
    path('api/', include('apps.menu.urls')),  # This includes /api/menu/ endpoints
    path('api/', include('apps.bookings.urls')),  # This includes /api/bookings/
    path('api/', include('apps.pricing.urls')),  # This includes /api/pricing/
    
    # API documentation (optional - disabled for now)
    # path('api/docs/', include_docs_urls(title='Marquee System API')),
    
    # DRF auth endpoints
    path('api-auth/', include('rest_framework.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
