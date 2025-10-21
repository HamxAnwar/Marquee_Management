from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PricingRuleViewSet, calculate_price, suggest_menu_by_budget

router = DefaultRouter()
router.register(r'rules', PricingRuleViewSet)

app_name = 'pricing'
urlpatterns = [
    path('', include(router.urls)),
    path('calculate/', calculate_price, name='calculate_price'),
    path('suggest/', suggest_menu_by_budget, name='suggest_menu'),
]