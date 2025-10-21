from django.contrib import admin
from django.utils.html import format_html
from .models import Booking, BookingMenuItem, BookingStatusHistory


class BookingMenuItemInline(admin.TabularInline):
    model = BookingMenuItem
    extra = 0
    readonly_fields = ['total_price']
    fields = ['menu_item', 'variant', 'quantity', 'unit_price', 'total_price', 'notes']


class BookingStatusHistoryInline(admin.TabularInline):
    model = BookingStatusHistory
    extra = 0
    readonly_fields = ['timestamp', 'changed_by']
    can_delete = False


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['booking_id', 'customer_name', 'hall', 'event_date', 'guest_count', 
                   'total_amount', 'status_badge', 'created_at']
    list_filter = ['status', 'event_type', 'hall', 'event_date', 'created_at']
    search_fields = ['booking_id', 'customer__username', 'customer__email', 'contact_phone']
    readonly_fields = ['booking_id', 'created_at', 'updated_at', 'confirmed_at']
    inlines = [BookingMenuItemInline, BookingStatusHistoryInline]
    date_hierarchy = 'event_date'
    
    fieldsets = (
        ('Booking Information', {
            'fields': ('booking_id', 'customer', 'hall', 'status')
        }),
        ('Event Details', {
            'fields': ('event_date', 'event_time', 'event_type', 'guest_count')
        }),
        ('Contact Information', {
            'fields': ('contact_phone', 'contact_email')
        }),
        ('Pricing', {
            'fields': ('subtotal', 'discount_amount', 'tax_amount', 'total_amount')
        }),
        ('Additional Information', {
            'fields': ('special_requirements', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'confirmed_at'),
            'classes': ('collapse',)
        })
    )
    
    def customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username
    customer_name.short_description = 'Customer'
    
    def status_badge(self, obj):
        colors = {
            'pending': 'orange',
            'confirmed': 'green',
            'cancelled': 'red',
            'completed': 'blue'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(BookingMenuItem)
class BookingMenuItemAdmin(admin.ModelAdmin):
    list_display = ['booking', 'menu_item', 'variant', 'quantity', 'unit_price', 'total_price']
    list_filter = ['booking__status', 'menu_item__category']
    search_fields = ['booking__booking_id', 'menu_item__name']
    readonly_fields = ['total_price']


@admin.register(BookingStatusHistory)
class BookingStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['booking', 'old_status', 'new_status', 'changed_by', 'timestamp']
    list_filter = ['old_status', 'new_status', 'timestamp']
    search_fields = ['booking__booking_id', 'reason']
    readonly_fields = ['timestamp']
