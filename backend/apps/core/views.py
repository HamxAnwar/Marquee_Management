from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth.models import User
from .models import Hall, DiscountTier, UserProfile
from .serializers import (
    HallSerializer, HallListSerializer, DiscountTierSerializer, 
    DiscountTierApplicableSerializer, UserSerializer, UserProfileSerializer
)


class HallViewSet(viewsets.ModelViewSet):
    """ViewSet for managing halls"""
    queryset = Hall.objects.all()
    serializer_class = HallSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return HallListSerializer
        return HallSerializer
    
    def get_queryset(self):
        queryset = Hall.objects.all()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by capacity range
        min_capacity = self.request.query_params.get('min_capacity')
        max_capacity = self.request.query_params.get('max_capacity')
        if min_capacity:
            queryset = queryset.filter(capacity__gte=min_capacity)
        if max_capacity:
            queryset = queryset.filter(capacity__lte=max_capacity)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)
        
        # Search by name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.order_by('name')
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get only active halls"""
        halls = self.get_queryset().filter(is_active=True)
        serializer = HallListSerializer(halls, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def capacity_check(self, request, pk=None):
        """Check if hall can accommodate guest count"""
        hall = self.get_object()
        guest_count = request.query_params.get('guest_count')
        
        if not guest_count:
            return Response(
                {'error': 'guest_count parameter required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            guest_count = int(guest_count)
        except ValueError:
            return Response(
                {'error': 'guest_count must be an integer'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        can_accommodate = hall.capacity >= guest_count
        return Response({
            'hall': hall.name,
            'capacity': hall.capacity,
            'requested_guests': guest_count,
            'can_accommodate': can_accommodate,
            'available_space': hall.capacity - guest_count if can_accommodate else 0
        })


class DiscountTierViewSet(viewsets.ModelViewSet):
    """ViewSet for managing discount tiers"""
    queryset = DiscountTier.objects.all()
    serializer_class = DiscountTierSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = DiscountTier.objects.all()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('min_guests')
    
    @action(detail=False, methods=['get'])
    def for_guest_count(self, request):
        """Get applicable discount tier for specific guest count"""
        guest_count = request.query_params.get('guest_count')
        
        if not guest_count:
            return Response(
                {'error': 'guest_count parameter required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            guest_count = int(guest_count)
        except ValueError:
            return Response(
                {'error': 'guest_count must be an integer'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find applicable discount tier
        applicable_tier = DiscountTier.objects.filter(
            is_active=True,
            min_guests__lte=guest_count,
            max_guests__gte=guest_count
        ).first()
        
        if applicable_tier:
            serializer = DiscountTierSerializer(applicable_tier)
            return Response({
                'guest_count': guest_count,
                'applicable_tier': serializer.data
            })
        else:
            return Response({
                'guest_count': guest_count,
                'applicable_tier': None,
                'message': 'No applicable discount tier found for this guest count'
            })


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for user management (read-only)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own profile, staff can see all
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for user profiles"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own profile, staff can see all
        if self.request.user.is_staff:
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Automatically set user to current user
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Get or update current user's profile"""
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            if request.method == 'GET':
                return Response(
                    {'error': 'Profile not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            # Create profile if it doesn't exist
            profile = UserProfile.objects.create(user=request.user)
        
        if request.method == 'GET':
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = UserProfileSerializer(
                profile, 
                data=request.data, 
                partial=partial
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
