from django.contrib import admin
from .models import PricingRule, PriceCalculation, BudgetSuggestion, SuggestedMenuItem


@admin.register(PricingRule)
class PricingRuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'rule_type', 'value', 'min_guests', 'max_guests', 'is_active']
    list_filter = ['rule_type', 'is_active', 'created_at']
    search_fields = ['name']
    filter_horizontal = ['applicable_halls']
    
    fieldsets = (
        ('Rule Information', {
            'fields': ('name', 'rule_type', 'value')
        }),
        ('Conditions', {
            'fields': ('min_guests', 'max_guests', 'applicable_halls', 'applicable_days')
        }),
        ('Validity', {
            'fields': ('is_active', 'valid_from', 'valid_until')
        })
    )


@admin.register(PriceCalculation)
class PriceCalculationAdmin(admin.ModelAdmin):
    list_display = ['booking', 'grand_total', 'price_per_person', 'guest_discount_tier', 'calculated_at']
    list_filter = ['guest_discount_tier', 'calculated_at']
    search_fields = ['booking__booking_id']
    readonly_fields = ['calculated_at']
    
    fieldsets = (
        ('Basic Calculation', {
            'fields': ('booking', 'hall_base_price', 'menu_subtotal')
        }),
        ('Discounts', {
            'fields': ('guest_discount_tier', 'guest_discount_amount')
        }),
        ('Additional Charges', {
            'fields': ('service_charge_rate', 'service_charge_amount', 'tax_rate', 'tax_amount')
        }),
        ('Totals', {
            'fields': ('subtotal_before_discount', 'total_discount', 'subtotal_after_discount', 
                      'grand_total', 'price_per_person')
        }),
        ('Metadata', {
            'fields': ('calculated_at',)
        })
    )


class SuggestedMenuItemInline(admin.TabularInline):
    model = SuggestedMenuItem
    extra = 0
    fields = ['menu_item', 'suggested_quantity', 'estimated_cost']


@admin.register(BudgetSuggestion)
class BudgetSuggestionAdmin(admin.ModelAdmin):
    list_display = ['target_budget', 'guest_count', 'hall', 'total_estimated_cost', 
                   'variance_percentage', 'is_accepted', 'created_at']
    list_filter = ['is_accepted', 'hall', 'created_at']
    search_fields = ['hall__name']
    readonly_fields = ['created_at']
    inlines = [SuggestedMenuItemInline]
    
    fieldsets = (
        ('Request Parameters', {
            'fields': ('target_budget', 'guest_count', 'hall')
        }),
        ('Suggestion Results', {
            'fields': ('suggested_per_person_budget', 'total_estimated_cost', 'variance_percentage')
        }),
        ('Status', {
            'fields': ('is_accepted', 'created_at')
        })
    )


@admin.register(SuggestedMenuItem)
class SuggestedMenuItemAdmin(admin.ModelAdmin):
    list_display = ['suggestion', 'menu_item', 'suggested_quantity', 'estimated_cost']
    list_filter = ['menu_item__category', 'suggestion__created_at']
    search_fields = ['menu_item__name', 'suggestion__hall__name']
