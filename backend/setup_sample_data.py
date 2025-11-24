#!/usr/bin/env python
"""
Script to populate the database with sample data for development and testing
"""

import os
import sys
import django
from decimal import Decimal
from datetime import date, time, timedelta

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'marquee_system.settings')
django.setup()

from django.contrib.auth.models import User
from apps.core.models import Hall, DiscountTier, UserProfile
from apps.menu.models import MenuCategory, MenuItem, MenuItemVariant
from apps.bookings.models import Booking, BookingMenuItem
from apps.pricing.models import PricingRule


def create_sample_data():
    print("🎪 Creating sample data for Marquee Booking System...")

    # Run the menu population script first
    print("🍽️ Populating comprehensive menu data...")
    try:
        import subprocess
        result = subprocess.run([sys.executable, 'populate_menu_data.py'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Menu data populated successfully!")
        else:
            print("⚠️ Menu population had some issues, continuing...")
    except Exception as e:
        print(f"⚠️ Could not run menu population script: {e}")

    # Create Halls
    print("📍 Creating halls...")
    hall1, created = Hall.objects.get_or_create(
        name="Sultanat Marquee Main Hall",
        defaults={
            'description': 'Main wedding hall with elegant decor and modern facilities',
            'capacity': 500,
            'base_price': Decimal('50000.00')
        }
    )
    
    hall2, created = Hall.objects.get_or_create(
        name="Sultanat Marquee Garden Hall",
        defaults={
            'description': 'Outdoor garden setting perfect for evening events',
            'capacity': 300,
            'base_price': Decimal('35000.00')
        }
    )
    
    # Create Discount Tiers
    print("💰 Creating discount tiers...")
    tiers = [
        ("Small Event", 1, 50, Decimal('0.00')),
        ("Medium Event", 51, 150, Decimal('5.00')),
        ("Large Event", 151, 300, Decimal('10.00')),
        ("Premium Event", 301, 500, Decimal('15.00')),
        ("Mega Event", 501, 1000, Decimal('20.00')),
    ]
    
    for name, min_guests, max_guests, discount in tiers:
        DiscountTier.objects.get_or_create(
            name=name,
            defaults={
                'min_guests': min_guests,
                'max_guests': max_guests,
                'discount_percentage': discount
            }
        )
    
    # Create Menu Categories
    print("🍽️ Creating menu categories...")
    categories = [
        ("Appetizers", "Starters and light snacks", 1),
        ("Main Course", "Primary dishes", 2),
        ("Rice & Bread", "Rice dishes and bread varieties", 3),
        ("Desserts", "Sweet treats and traditional desserts", 4),
        ("Beverages", "Drinks and refreshments", 5),
    ]
    
    category_objects = {}
    for name, desc, order in categories:
        cat, created = MenuCategory.objects.get_or_create(
            name=name,
            defaults={
                'description': desc,
                'display_order': order
            }
        )
        category_objects[name] = cat
    
    # Create Menu Items
    print("🥘 Creating menu items...")
    menu_items = [
        # Appetizers
        ("Chicken Tikka", "Appetizers", "Grilled chicken pieces with spices", Decimal('1200.00'), "per_plate", False),
        ("Seekh Kebab", "Appetizers", "Spiced minced meat kebabs", Decimal('1000.00'), "per_plate", False),
        ("Vegetable Samosa", "Appetizers", "Crispy fried pastries with vegetables", Decimal('300.00'), "per_piece", True),
        
        # Main Course
        ("Chicken Karahi", "Main Course", "Traditional chicken curry", Decimal('2000.00'), "per_kg", False),
        ("Mutton Korma", "Main Course", "Tender mutton in rich gravy", Decimal('3500.00'), "per_kg", False),
        ("Dal Makhani", "Main Course", "Creamy black lentils", Decimal('1500.00'), "per_kg", True),
        ("Vegetable Biryani", "Main Course", "Aromatic rice with mixed vegetables", Decimal('1800.00'), "per_kg", True),
        
        # Rice & Bread
        ("Chicken Biryani", "Rice & Bread", "Aromatic rice with chicken", Decimal('2500.00'), "per_kg", False),
        ("Plain Basmati Rice", "Rice & Bread", "Steamed basmati rice", Decimal('800.00'), "per_kg", True),
        ("Naan Bread", "Rice & Bread", "Traditional oven-baked bread", Decimal('150.00'), "per_piece", True),
        ("Roti", "Rice & Bread", "Whole wheat flatbread", Decimal('80.00'), "per_piece", True),
        
        # Desserts
        ("Gulab Jamun", "Desserts", "Sweet milk dumplings in syrup", Decimal('100.00'), "per_piece", True),
        ("Kheer", "Desserts", "Traditional rice pudding", Decimal('800.00'), "per_kg", True),
        ("Ras Malai", "Desserts", "Milk cheese balls in cream", Decimal('150.00'), "per_piece", True),
        
        # Beverages
        ("Fresh Juice", "Beverages", "Seasonal fresh fruit juice", Decimal('250.00'), "per_plate", True),
        ("Soft Drinks", "Beverages", "Assorted carbonated drinks", Decimal('100.00'), "per_piece", True),
        ("Tea/Coffee", "Beverages", "Hot beverages", Decimal('150.00'), "per_plate", True),
    ]
    
    for name, category_name, desc, price, serving, vegetarian in menu_items:
        MenuItem.objects.get_or_create(
            name=name,
            category=category_objects[category_name],
            defaults={
                'description': desc,
                'base_price': price,
                'serving_type': serving,
                'is_vegetarian': vegetarian
            }
        )
    
    # Create some menu item variants
    print("🔄 Creating menu variants...")
    chicken_tikka = MenuItem.objects.get(name="Chicken Tikka")
    MenuItemVariant.objects.get_or_create(
        menu_item=chicken_tikka,
        name="Extra Spicy",
        defaults={'price_modifier': Decimal('100.00')}
    )
    
    # Create Pricing Rules
    print("📊 Creating pricing rules...")
    PricingRule.objects.get_or_create(
        name="Weekend Premium",
        defaults={
            'rule_type': 'service_charge',
            'value': Decimal('10.00'),
            'applicable_days': '67',  # Saturday and Sunday
            'is_active': True
        }
    )
    
    PricingRule.objects.get_or_create(
        name="Large Event Service Charge",
        defaults={
            'rule_type': 'service_charge',
            'value': Decimal('5.00'),
            'min_guests': 200,
            'is_active': True
        }
    )
    
    # Create sample customer
    print("👤 Creating sample customer...")
    customer, created = User.objects.get_or_create(
        username='sample_customer',
        defaults={
            'first_name': 'Ahmed',
            'last_name': 'Khan',
            'email': 'ahmed.khan@example.com'
        }
    )
    
    if created:
        customer.set_password('customer123')
        customer.save()
        
        UserProfile.objects.create(
            user=customer,
            phone='+92-300-1234567',
            address='Sample Address, Quetta',
            preferred_contact='phone'
        )
    
    # Create a sample booking
    print("📅 Creating sample booking...")
    booking, created = Booking.objects.get_or_create(
        customer=customer,
        hall=hall1,
        event_date=date.today() + timedelta(days=30),
        defaults={
            'event_time': time(18, 0),
            'event_type': 'wedding',
            'guest_count': 200,
            'contact_phone': '+92-300-1234567',
            'contact_email': 'ahmed.khan@example.com',
            'subtotal': Decimal('80000.00'),
            'total_amount': Decimal('80000.00'),
            'status': 'pending'
        }
    )
    
    if created:
        # Add some menu items to the booking
        chicken_karahi = MenuItem.objects.get(name="Chicken Karahi")
        BookingMenuItem.objects.create(
            booking=booking,
            menu_item=chicken_karahi,
            quantity=10,
            unit_price=chicken_karahi.base_price,
            total_price=10 * chicken_karahi.base_price
        )
        
        biryani = MenuItem.objects.get(name="Chicken Biryani")
        BookingMenuItem.objects.create(
            booking=booking,
            menu_item=biryani,
            quantity=15,
            unit_price=biryani.base_price,
            total_price=15 * biryani.base_price
        )
    
    print("✅ Sample data created successfully!")
    print("\n📊 Summary:")
    print(f"   Halls: {Hall.objects.count()}")
    print(f"   Discount Tiers: {DiscountTier.objects.count()}")
    print(f"   Menu Categories: {MenuCategory.objects.count()}")
    print(f"   Menu Items: {MenuItem.objects.count()}")
    print(f"   Users: {User.objects.count()}")
    print(f"   Bookings: {Booking.objects.count()}")
    print(f"   Pricing Rules: {PricingRule.objects.count()}")
    print("\n🚀 You can now start the Django server and explore the admin interface!")


if __name__ == '__main__':
    create_sample_data()