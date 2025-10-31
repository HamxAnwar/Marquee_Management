from django.contrib import admin
from .models import MenuCategory, MenuItem, MenuItemVariant


@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "display_order", "is_active", "created_at"]
    list_filter = ["is_active", "created_at"]
    search_fields = ["name"]
    ordering = ["display_order", "name"]


class MenuItemVariantInline(admin.TabularInline):
    model = MenuItemVariant
    extra = 0
    fields = ["name", "price_modifier", "is_available"]


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "category",
        "base_price",
        "serving_type",
        "dietary_type",
        "is_available",
    ]
    list_filter = [
        "category",
        "serving_type",
        "dietary_type",
        "is_available",
        "created_at",
    ]
    search_fields = ["name", "description", "ingredients"]
    ordering = ["category__display_order", "display_order", "name"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [MenuItemVariantInline]

    fieldsets = (
        ("Basic Information", {"fields": ("name", "category", "description", "image")}),
        ("Pricing & Serving", {"fields": ("base_price", "serving_type")}),
        (
            "Details",
            {
                "fields": (
                    "ingredients",
                    "preparation_time",
                    "dietary_type",
                    "spice_level",
                )
            },
        ),
        ("Display & Availability", {"fields": ("display_order", "is_available")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(MenuItemVariant)
class MenuItemVariantAdmin(admin.ModelAdmin):
    list_display = [
        "menu_item",
        "name",
        "price_modifier",
        "final_price",
        "is_available",
    ]
    list_filter = ["is_available", "menu_item__category"]
    search_fields = ["menu_item__name", "name"]
