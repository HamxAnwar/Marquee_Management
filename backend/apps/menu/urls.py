from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MenuCategoryViewSet, MenuItemViewSet, MenuItemVariantViewSet,
    MenuPackageViewSet, PackageMenuItemViewSet
)

router = DefaultRouter()
router.register(r'menu/categories', MenuCategoryViewSet, basename='menu-category')
router.register(r'menu/items', MenuItemViewSet, basename='menu-item')
router.register(r'menu/variants', MenuItemVariantViewSet, basename='menu-variant')
router.register(r'menu/packages', MenuPackageViewSet, basename='menu-package')
router.register(r'menu/package-items', PackageMenuItemViewSet, basename='package-menu-item')

app_name = 'menu'
urlpatterns = [
    path('', include(router.urls)),
]
