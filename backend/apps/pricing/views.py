from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from decimal import Decimal
from .models import PricingRule, PriceCalculation, BudgetSuggestion
from .serializers import (
    PricingRuleSerializer, PriceCalculationSerializer, BudgetSuggestionSerializer,
    PriceCalculationRequestSerializer, PriceCalculationResponseSerializer,
    BudgetSuggestionRequestSerializer, BudgetSuggestionResponseSerializer
)
from apps.core.models import Hall, DiscountTier
from apps.menu.models import MenuItem


class PricingRuleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing pricing rules"""
    queryset = PricingRule.objects.all()
    serializer_class = PricingRuleSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = PricingRule.objects.all()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('name')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def calculate_price(request):
    """Calculate pricing for given parameters"""
    # Basic price calculation logic (placeholder)
    data = request.data
    
    try:
        hall = Hall.objects.get(id=data.get('hall_id'), is_active=True)
        guest_count = int(data.get('guest_count', 0))
        
        # Simple calculation
        total = hall.base_price
        
        return Response({
            'hall_base_price': hall.base_price,
            'guest_count': guest_count,
            'estimated_total': total,
            'price_per_person': total / guest_count if guest_count > 0 else 0
        })
    except (Hall.DoesNotExist, ValueError, TypeError) as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def suggest_menu_by_budget(request):
    """Suggest menu items based on budget"""
    # Basic budget suggestion logic (placeholder)
    data = request.data
    target_budget = data.get('target_budget', 0)
    guest_count = data.get('guest_count', 0)
    
    # Simple suggestion
    menu_items = MenuItem.objects.filter(is_available=True)[:5]
    
    return Response({
        'target_budget': target_budget,
        'guest_count': guest_count,
        'suggested_items': [{
            'id': item.id,
            'name': item.name,
            'price': item.base_price
        } for item in menu_items]
    })
