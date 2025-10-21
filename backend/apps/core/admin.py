from django.contrib import admin
from .models import Hall, DiscountTier, UserProfile


@admin.register(Hall)
class HallAdmin(admin.ModelAdmin):
    list_display = ['name', 'capacity', 'base_price', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'image')
        }),
        ('Capacity & Pricing', {
            'fields': ('capacity', 'base_price')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(DiscountTier)
class DiscountTierAdmin(admin.ModelAdmin):
    list_display = ['name', 'min_guests', 'max_guests', 'discount_percentage', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']
    ordering = ['min_guests']
    
    fieldsets = (
        ('Tier Information', {
            'fields': ('name', 'min_guests', 'max_guests')
        }),
        ('Discount', {
            'fields': ('discount_percentage',)
        }),
        ('Status', {
            'fields': ('is_active',)
        })
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'preferred_contact', 'created_at']
    list_filter = ['preferred_contact', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone']
    readonly_fields = ['created_at']
