from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import MenuCategory, MenuItem, MenuItemVariant
from .serializers import (
    MenuCategorySerializer, MenuCategoryWithItemsSerializer,
    MenuItemSerializer, MenuItemListSerializer, MenuItemDetailSerializer,
    MenuItemCreateSerializer, MenuItemVariantSerializer
)


class MenuCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing menu categories"""
    queryset = MenuCategory.objects.all()
    serializer_class = MenuCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = MenuCategory.objects.all()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('display_order', 'name')
    
    @action(detail=False, methods=['get'])
    def with_items(self, request):
        """Get categories with their menu items"""
        categories = self.get_queryset().filter(is_active=True)
        serializer = MenuCategoryWithItemsSerializer(categories, many=True)
        return Response(serializer.data)


class MenuItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing menu items"""
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MenuItemListSerializer
        elif self.action == 'retrieve':
            return MenuItemDetailSerializer
        elif self.action == 'create':
            return MenuItemCreateSerializer
        return MenuItemSerializer
    
    def get_queryset(self):
        queryset = MenuItem.objects.select_related('category').prefetch_related('variants')
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Filter by availability
        is_available = self.request.query_params.get('is_available')
        if is_available is not None:
            queryset = queryset.filter(is_available=is_available.lower() == 'true')
        
        # Filter by vegetarian
        is_vegetarian = self.request.query_params.get('is_vegetarian')
        if is_vegetarian is not None:
            queryset = queryset.filter(is_vegetarian=is_vegetarian.lower() == 'true')
        
        # Filter by serving type
        serving_type = self.request.query_params.get('serving_type')
        if serving_type:
            queryset = queryset.filter(serving_type=serving_type)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)
        
        # Search by name, description, or ingredients
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) | 
                Q(ingredients__icontains=search)
            )
        
        return queryset.order_by('category__display_order', 'display_order', 'name')
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get only available menu items"""
        items = self.get_queryset().filter(is_available=True)
        serializer = MenuItemListSerializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def vegetarian(self, request):
        """Get only vegetarian items"""
        items = self.get_queryset().filter(is_vegetarian=True, is_available=True)
        serializer = MenuItemListSerializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get items grouped by category"""
        categories = MenuCategory.objects.filter(is_active=True).order_by('display_order')
        result = []
        
        for category in categories:
            items = self.get_queryset().filter(
                category=category, 
                is_available=True
            )
            serializer = MenuItemListSerializer(items, many=True)
            result.append({
                'category': {
                    'id': category.id,
                    'name': category.name,
                    'description': category.description
                },
                'items': serializer.data
            })
        
        return Response(result)
    
    @action(detail=True, methods=['get'])
    def variants(self, request, pk=None):
        """Get variants for a specific menu item"""
        item = self.get_object()
        variants = item.variants.filter(is_available=True)
        serializer = MenuItemVariantSerializer(variants, many=True)
        return Response({
            'menu_item': MenuItemListSerializer(item).data,
            'variants': serializer.data
        })


class MenuItemVariantViewSet(viewsets.ModelViewSet):
    """ViewSet for managing menu item variants"""
    queryset = MenuItemVariant.objects.all()
    serializer_class = MenuItemVariantSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = MenuItemVariant.objects.select_related('menu_item')
        
        # Filter by menu item
        menu_item = self.request.query_params.get('menu_item')
        if menu_item:
            queryset = queryset.filter(menu_item_id=menu_item)
        
        # Filter by availability
        is_available = self.request.query_params.get('is_available')
        if is_available is not None:
            queryset = queryset.filter(is_available=is_available.lower() == 'true')
        
        return queryset.order_by('menu_item__name', 'name')
