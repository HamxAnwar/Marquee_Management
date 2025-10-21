from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuCategoryViewSet, MenuItemViewSet, MenuItemVariantViewSet

router = DefaultRouter()
router.register(r'menu/categories', MenuCategoryViewSet, basename='menu-category')
router.register(r'menu/items', MenuItemViewSet, basename='menu-item')
router.register(r'menu/variants', MenuItemVariantViewSet, basename='menu-variant')

app_name = 'menu'
urlpatterns = [
    path('', include(router.urls)),
]
