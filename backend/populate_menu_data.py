#!/usr/bin/env python
"""
Populate Pakistani Marquee Menu Data with PKR Pricing
Run this script to add comprehensive menu items for Pakistani events
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'marquee_system.settings')
django.setup()

from apps.menu.models import MenuCategory, MenuItem, MenuPackage, PackageMenuItem
from apps.core.models import Organization
from decimal import Decimal


def create_menu_categories(organization):
    """Create menu categories for Pakistani cuisine"""
    categories_data = [
        {
            'name': 'Appetizers & Starters',
            'description': 'Traditional Pakistani appetizers and finger foods',
            'display_order': 1
        },
        {
            'name': 'Main Course - Chicken',
            'description': 'Delicious chicken dishes and curries',
            'display_order': 2
        },
        {
            'name': 'Main Course - Mutton/Beef',
            'description': 'Premium mutton and beef specialties',
            'display_order': 3
        },
        {
            'name': 'Vegetarian Dishes',
            'description': 'Flavorful vegetarian options',
            'display_order': 4
        },
        {
            'name': 'Rice & Biryani',
            'description': 'Aromatic rice dishes and biryanis',
            'display_order': 5
        },
        {
            'name': 'Bread & Naan',
            'description': 'Fresh baked bread and naan varieties',
            'display_order': 6
        },
        {
            'name': 'Desserts',
            'description': 'Traditional Pakistani sweets and desserts',
            'display_order': 7
        },
        {
            'name': 'Beverages',
            'description': 'Refreshing drinks and traditional beverages',
            'display_order': 8
        }
    ]

    created_categories = {}
    for cat_data in categories_data:
        category, created = MenuCategory.objects.get_or_create(
            organization=organization,
            name=cat_data['name'],
            defaults=cat_data
        )
        created_categories[cat_data['name']] = category
        if created:
            print(f"✓ Created category: {category.name}")
        else:
            print(f"→ Category exists: {category.name}")

    return created_categories


def create_menu_packages(organization):
    """Create curated menu packages (deals) for Pakistani events"""

    # Get the sample organization
    try:
        organization = Organization.objects.get(name='Sultanat Marquee')
    except Organization.DoesNotExist:
        print("❌ Organization 'Sultanat Marquee' not found. Please run setup_sample_data.py first.")
        return 0

    # Get menu items for creating packages
    menu_items = {item.name: item for item in MenuItem.objects.filter(organization=organization)}

    packages_data = [
        {
            'name': 'Deal 1 - Basic Wedding Package',
            'description': 'Perfect for intimate weddings with essential Pakistani dishes',
            'package_type': 'wedding',
            'base_price_per_person': Decimal('450.00'),
            'min_guests': 50,
            'max_guests': 150,
            'items': [
                {'name': 'Chicken Samosa', 'quantity': 1.0},
                {'name': 'Chicken Karahi', 'quantity': 0.5},
                {'name': 'Dal Makhani', 'quantity': 0.3},
                {'name': 'Chicken Biryani', 'quantity': 0.5},
                {'name': 'Butter Naan', 'quantity': 1.0},
                {'name': 'Gulab Jamun', 'quantity': 1.0},
                {'name': 'Lassi (Sweet)', 'quantity': 1.0},
            ]
        },
        {
            'name': 'Deal 2 - Premium Wedding Package',
            'description': 'Luxurious wedding package with premium Pakistani cuisine',
            'package_type': 'wedding',
            'base_price_per_person': Decimal('650.00'),
            'min_guests': 100,
            'max_guests': 300,
            'items': [
                {'name': 'Chicken Tikka', 'quantity': 0.8},
                {'name': 'Seekh Kebab', 'quantity': 0.8},
                {'name': 'Butter Chicken', 'quantity': 0.6},
                {'name': 'Mutton Karahi', 'quantity': 0.4},
                {'name': 'Palak Paneer', 'quantity': 0.3},
                {'name': 'Mutton Biryani', 'quantity': 0.6},
                {'name': 'Garlic Naan', 'quantity': 1.2},
                {'name': 'Ras Malai', 'quantity': 1.0},
                {'name': 'Kheer', 'quantity': 0.5},
                {'name': 'Kashmiri Tea', 'quantity': 1.0},
            ]
        },
        {
            'name': 'Deal 3 - Corporate Event Package',
            'description': 'Professional catering for business events and conferences',
            'package_type': 'corporate',
            'base_price_per_person': Decimal('350.00'),
            'min_guests': 20,
            'max_guests': 200,
            'items': [
                {'name': 'Vegetable Samosa', 'quantity': 1.0},
                {'name': 'Chicken Jalfrezi', 'quantity': 0.4},
                {'name': 'Mixed Vegetable Curry', 'quantity': 0.4},
                {'name': 'Plain Basmati Rice', 'quantity': 0.5},
                {'name': 'Butter Naan', 'quantity': 1.0},
                {'name': 'Fresh Lime Water', 'quantity': 1.0},
            ]
        },
        {
            'name': 'Deal 4 - Birthday Celebration Package',
            'description': 'Fun and festive package for birthday parties',
            'package_type': 'birthday',
            'base_price_per_person': Decimal('400.00'),
            'min_guests': 30,
            'max_guests': 100,
            'items': [
                {'name': 'Chicken Samosa', 'quantity': 1.5},
                {'name': 'Chicken Handi', 'quantity': 0.5},
                {'name': 'Aloo Gobi', 'quantity': 0.3},
                {'name': 'Vegetable Biryani', 'quantity': 0.5},
                {'name': 'Paratha', 'quantity': 1.0},
                {'name': 'Gajar Ka Halwa', 'quantity': 0.8},
                {'name': 'Rooh Afza', 'quantity': 1.0},
            ]
        },
        {
            'name': 'Deal 5 - Deluxe Family Package',
            'description': 'Premium family gathering with the best of Pakistani cuisine',
            'package_type': 'custom',
            'base_price_per_person': Decimal('550.00'),
            'min_guests': 50,
            'max_guests': 200,
            'items': [
                {'name': 'Dahi Bara', 'quantity': 1.0},
                {'name': 'Chicken Tikka', 'quantity': 0.7},
                {'name': 'Mutton Kunna', 'quantity': 0.5},
                {'name': 'Dal Makhani', 'quantity': 0.4},
                {'name': 'Palak Paneer', 'quantity': 0.3},
                {'name': 'Chicken Biryani', 'quantity': 0.6},
                {'name': 'Garlic Naan', 'quantity': 1.5},
                {'name': 'Kulfi', 'quantity': 1.0},
                {'name': 'Lassi (Salty)', 'quantity': 1.0},
            ]
        }
    ]

    created_count = 0
    for package_data in packages_data:
        items_data = package_data.pop('items')
        package, created = MenuPackage.objects.get_or_create(
            organization=organization,
            name=package_data['name'],
            defaults=package_data
        )

        if created:
            # Create package items
            for item_data in items_data:
                menu_item = menu_items.get(item_data['name'])
                if menu_item:
                    PackageMenuItem.objects.create(
                        package=package,
                        menu_item=menu_item,
                        quantity_per_person=item_data['quantity']
                    )

            created_count += 1
            print(f"✓ Created package: {package.name} - PKR {package.base_price_per_person}/person")
        else:
            print(f"→ Package exists: {package.name}")

    return created_count


def create_menu_items(organization, categories):
    """Create comprehensive Pakistani menu items with PKR pricing"""

    menu_items_data = [
        # Appetizers & Starters
        {
            'category': 'Appetizers & Starters',
            'name': 'Chicken Samosa',
            'description': 'Crispy pastry filled with spiced chicken mince',
            'base_price': 50,
            'serving_type': 'per_piece',
            'dietary_type': 'regular',
            'ingredients': 'Chicken mince, onions, spices, pastry'
        },
        {
            'category': 'Appetizers & Starters',
            'name': 'Vegetable Samosa',
            'description': 'Golden fried pastry with mixed vegetable filling',
            'base_price': 40,
            'serving_type': 'per_piece',
            'dietary_type': 'vegetarian',
            'ingredients': 'Mixed vegetables, spices, pastry'
        },
        {
            'category': 'Appetizers & Starters',
            'name': 'Chicken Tikka',
            'description': 'Grilled marinated chicken pieces',
            'base_price': 350,
            'serving_type': 'per_plate',
            'dietary_type': 'regular',
            'ingredients': 'Chicken, yogurt, spices, herbs'
        },
        {
            'category': 'Appetizers & Starters',
            'name': 'Seekh Kebab',
            'description': 'Spiced minced meat grilled on skewers',
            'base_price': 400,
            'serving_type': 'per_plate',
            'dietary_type': 'regular',
            'ingredients': 'Minced meat, onions, spices'
        },
        {
            'category': 'Appetizers & Starters',
            'name': 'Dahi Bara',
            'description': 'Lentil dumplings in creamy yogurt',
            'base_price': 180,
            'serving_type': 'per_plate',
            'dietary_type': 'vegetarian',
            'ingredients': 'Lentils, yogurt, spices, chutneys'
        },

        # Main Course - Chicken
        {
            'category': 'Main Course - Chicken',
            'name': 'Chicken Karahi',
            'description': 'Traditional chicken curry cooked in a wok',
            'base_price': 850,
            'serving_type': 'per_kg',
            'dietary_type': 'regular',
            'ingredients': 'Chicken, tomatoes, ginger, garlic, spices'
        },
        {
            'category': 'Main Course - Chicken',
            'name': 'Butter Chicken',
            'description': 'Creamy tomato-based chicken curry',
            'base_price': 950,
            'serving_type': 'per_kg',
            'dietary_type': 'regular',
            'ingredients': 'Chicken, cream, tomatoes, butter, spices'
        },
        {
            'category': 'Main Course - Chicken',
            'name': 'Chicken Handi',
            'description': 'Rich and flavorful chicken curry',
            'base_price': 900,
            'serving_type': 'per_kg',
            'dietary_type': 'regular',
            'ingredients': 'Chicken, yogurt, onions, spices'
        },
        {
            'category': 'Main Course - Chicken',
            'name': 'Chicken Jalfrezi',
            'description': 'Stir-fried chicken with vegetables',
            'base_price': 800,
            'serving_type': 'per_kg',
            'dietary_type': 'regular',
            'ingredients': 'Chicken, bell peppers, onions, tomatoes'
        },

        # Main Course - Mutton/Beef
        {
            'category': 'Main Course - Mutton/Beef',
            'name': 'Mutton Karahi',
            'description': 'Premium mutton cooked in traditional style',
            'base_price': 1200,
            'serving_type': 'per_kg',
            'dietary_type': 'regular',
            'ingredients': 'Mutton, tomatoes, ginger, garlic, spices'
        },
        {
            'category': 'Main Course - Mutton/Beef',
            'name': 'Beef Nihari',
            'description': 'Slow-cooked beef in rich, spicy gravy',
            'base_price': 1100,
            'serving_type': 'per_kg',
            'dietary_type': 'regular',
            'ingredients': 'Beef, wheat flour, spices, bone marrow'
        },
        {
            'category': 'Main Course - Mutton/Beef',
            'name': 'Mutton Kunna',
            'description': 'Traditional Lahori mutton curry',
            'base_price': 1300,
            'serving_type': 'per_kg',
            'dietary_type': 'regular',
            'ingredients': 'Mutton, yogurt, spices, herbs'
        },

        # Vegetarian Dishes
        {
            'category': 'Vegetarian Dishes',
            'name': 'Dal Makhani',
            'description': 'Creamy black lentils with butter',
            'base_price': 400,
            'serving_type': 'per_kg',
            'dietary_type': 'vegetarian',
            'ingredients': 'Black lentils, butter, cream, spices'
        },
        {
            'category': 'Vegetarian Dishes',
            'name': 'Palak Paneer',
            'description': 'Cottage cheese in spinach gravy',
            'base_price': 450,
            'serving_type': 'per_kg',
            'dietary_type': 'vegetarian',
            'ingredients': 'Paneer, spinach, cream, spices'
        },
        {
            'category': 'Vegetarian Dishes',
            'name': 'Mixed Vegetable Curry',
            'description': 'Seasonal vegetables in spiced gravy',
            'base_price': 350,
            'serving_type': 'per_kg',
            'dietary_type': 'vegetarian',
            'ingredients': 'Mixed vegetables, tomatoes, spices'
        },
        {
            'category': 'Vegetarian Dishes',
            'name': 'Aloo Gobi',
            'description': 'Cauliflower and potato curry',
            'base_price': 300,
            'serving_type': 'per_kg',
            'dietary_type': 'vegetarian',
            'ingredients': 'Cauliflower, potatoes, turmeric, spices'
        },

        # Rice & Biryani
        {
            'category': 'Rice & Biryani',
            'name': 'Chicken Biryani',
            'description': 'Aromatic basmati rice with chicken',
            'base_price': 450,
            'serving_type': 'per_plate',
            'dietary_type': 'regular',
            'ingredients': 'Basmati rice, chicken, saffron, spices'
        },
        {
            'category': 'Rice & Biryani',
            'name': 'Mutton Biryani',
            'description': 'Premium mutton biryani with fragrant rice',
            'base_price': 650,
            'serving_type': 'per_plate',
            'dietary_type': 'regular',
            'ingredients': 'Basmati rice, mutton, saffron, spices'
        },
        {
            'category': 'Rice & Biryani',
            'name': 'Vegetable Biryani',
            'description': 'Flavorful rice with mixed vegetables',
            'base_price': 350,
            'serving_type': 'per_plate',
            'dietary_type': 'vegetarian',
            'ingredients': 'Basmati rice, mixed vegetables, spices'
        },
        {
            'category': 'Rice & Biryani',
            'name': 'Plain Basmati Rice',
            'description': 'Steamed aromatic basmati rice',
            'base_price': 200,
            'serving_type': 'per_plate',
            'dietary_type': 'vegetarian',
            'ingredients': 'Basmati rice, ghee'
        },
        {
            'category': 'Rice & Biryani',
            'name': 'Pulao',
            'description': 'Spiced rice with vegetables and meat',
            'base_price': 300,
            'serving_type': 'per_plate',
            'dietary_type': 'regular',
            'ingredients': 'Rice, meat, vegetables, spices'
        },

        # Bread & Naan
        {
            'category': 'Bread & Naan',
            'name': 'Butter Naan',
            'description': 'Soft bread with butter',
            'base_price': 80,
            'serving_type': 'per_piece',
            'dietary_type': 'vegetarian',
            'ingredients': 'Flour, yogurt, butter'
        },
        {
            'category': 'Bread & Naan',
            'name': 'Garlic Naan',
            'description': 'Naan topped with fresh garlic',
            'base_price': 100,
            'serving_type': 'per_piece',
            'dietary_type': 'vegetarian',
            'ingredients': 'Flour, yogurt, garlic, herbs'
        },
        {
            'category': 'Bread & Naan',
            'name': 'Tandoori Roti',
            'description': 'Traditional whole wheat bread',
            'base_price': 40,
            'serving_type': 'per_piece',
            'dietary_type': 'vegetarian',
            'ingredients': 'Whole wheat flour'
        },
        {
            'category': 'Bread & Naan',
            'name': 'Paratha',
            'description': 'Layered flatbread',
            'base_price': 60,
            'serving_type': 'per_piece',
            'dietary_type': 'vegetarian',
            'ingredients': 'Flour, ghee, oil'
        },

        # Desserts
        {
            'category': 'Desserts',
            'name': 'Gulab Jamun',
            'description': 'Sweet milk dumplings in syrup',
            'base_price': 80,
            'serving_type': 'per_piece',
            'dietary_type': 'vegetarian',
            'ingredients': 'Milk powder, flour, sugar syrup'
        },
        {
            'category': 'Desserts',
            'name': 'Ras Malai',
            'description': 'Soft cottage cheese in sweet milk',
            'base_price': 150,
            'serving_type': 'per_piece',
            'dietary_type': 'vegetarian',
            'ingredients': 'Cottage cheese, milk, sugar, cardamom'
        },
        {
            'category': 'Desserts',
            'name': 'Kheer',
            'description': 'Traditional rice pudding',
            'base_price': 120,
            'serving_type': 'per_portion',
            'dietary_type': 'vegetarian',
            'ingredients': 'Rice, milk, sugar, nuts'
        },
        {
            'category': 'Desserts',
            'name': 'Kulfi',
            'description': 'Traditional Pakistani ice cream',
            'base_price': 100,
            'serving_type': 'per_piece',
            'dietary_type': 'vegetarian',
            'ingredients': 'Milk, cream, cardamom, pistachios'
        },
        {
            'category': 'Desserts',
            'name': 'Gajar Ka Halwa',
            'description': 'Sweet carrot pudding',
            'base_price': 200,
            'serving_type': 'per_portion',
            'dietary_type': 'vegetarian',
            'ingredients': 'Carrots, milk, sugar, ghee, nuts'
        },

        # Beverages
        {
            'category': 'Beverages',
            'name': 'Lassi (Sweet)',
            'description': 'Traditional yogurt drink',
            'base_price': 120,
            'serving_type': 'per_portion',
            'dietary_type': 'vegetarian',
            'ingredients': 'Yogurt, sugar, cardamom'
        },
        {
            'category': 'Beverages',
            'name': 'Lassi (Salty)',
            'description': 'Refreshing salted yogurt drink',
            'base_price': 120,
            'serving_type': 'per_portion',
            'dietary_type': 'vegetarian',
            'ingredients': 'Yogurt, salt, mint'
        },
        {
            'category': 'Beverages',
            'name': 'Fresh Lime Water',
            'description': 'Refreshing lime drink',
            'base_price': 80,
            'serving_type': 'per_portion',
            'dietary_type': 'vegetarian',
            'ingredients': 'Fresh lime, water, sugar/salt'
        },
        {
            'category': 'Beverages',
            'name': 'Rooh Afza',
            'description': 'Traditional rose syrup drink',
            'base_price': 100,
            'serving_type': 'per_portion',
            'dietary_type': 'vegetarian',
            'ingredients': 'Rooh Afza syrup, milk, ice'
        },
        {
            'category': 'Beverages',
            'name': 'Kashmiri Tea',
            'description': 'Pink tea with nuts',
            'base_price': 150,
            'serving_type': 'per_portion',
            'dietary_type': 'vegetarian',
            'ingredients': 'Special tea, milk, almonds, cardamom'
        }
    ]
    
    created_count = 0
    for item_data in menu_items_data:
        category = categories[item_data.pop('category')]
        
        menu_item, created = MenuItem.objects.get_or_create(
            organization=organization,
            name=item_data['name'],
            category=category,
            defaults={**item_data, 'organization': organization, 'category': category}
        )
        
        if created:
            created_count += 1
            print(f"✓ Created menu item: {menu_item.name} - PKR {menu_item.base_price}")
        else:
            print(f"→ Menu item exists: {menu_item.name}")
    
    print(f"\n🎉 Created {created_count} new menu items!")
    return created_count


def main():
    print("🍽️ Populating Pakistani Marquee Menu Data with PKR Pricing...")
    print("=" * 60)

    # Get the sample organization
    try:
        organization = Organization.objects.get(name='Sultanat Marquee')
    except Organization.DoesNotExist:
        print("❌ Organization 'Sultanat Marquee' not found. Please run setup_sample_data.py first.")
        return

    # Create categories
    print("\n📁 Creating menu categories...")
    categories = create_menu_categories(organization)

    # Create menu items
    print(f"\n🍛 Creating menu items...")
    created_items = create_menu_items(organization, categories)

    # Create menu packages (deals)
    print(f"\n📦 Creating menu packages (deals)...")
    created_packages = create_menu_packages(organization)

    print("\n" + "=" * 60)
    print(f"✅ Menu population completed!")
    print(f"📊 Total Categories: {len(categories)}")
    print(f"🍽️ Total Menu Items: {MenuItem.objects.count()}")
    print(f"📦 Total Menu Packages: {MenuPackage.objects.count()}")
    print("\n💰 All prices are in Pakistani Rupees (PKR)")
    print("🎯 Ready for customer browsing!")


if __name__ == '__main__':
    main()