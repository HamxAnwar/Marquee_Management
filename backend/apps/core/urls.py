from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HallViewSet, DiscountTierViewSet, UserViewSet, UserProfileViewSet

router = DefaultRouter()
router.register(r'halls', HallViewSet, basename='hall')
router.register(r'discount-tiers', DiscountTierViewSet, basename='discount-tier')
router.register(r'users', UserViewSet, basename='user')
router.register(r'user-profiles', UserProfileViewSet, basename='user-profile')

app_name = 'core'
urlpatterns = [
    path('', include(router.urls)),
]
