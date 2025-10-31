#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Multi-Tenant Marquee Management System${NC}"
echo -e "${CYAN}🏢 Platform: Event Venue Marketplace${NC}"
echo -e "${BLUE}📁 Project Directory: $(pwd)${NC}"

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down development servers...${NC}"
    echo -e "${RED}Terminating background processes...${NC}"
    kill $(jobs -p) 2>/dev/null
    pkill -f "python.*manage.py.*runserver" 2>/dev/null
    pkill -f "npm.*run.*dev" 2>/dev/null
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM EXIT

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment not found. Creating venv...${NC}"
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to create virtual environment. Please install python3-venv${NC}"
        echo -e "${YELLOW}On Ubuntu/Debian: sudo apt install python3-venv${NC}"
        echo -e "${YELLOW}On macOS: brew install python@3.11${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "\n${PURPLE}🔧 Activating virtual environment...${NC}"
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to activate virtual environment${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Virtual environment activated${NC}"

# Install/update backend dependencies
echo -e "\n${PURPLE}📦 Installing/updating backend dependencies...${NC}"
pip install --upgrade pip > /dev/null 2>&1
pip install -q -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install Python dependencies${NC}"
    echo -e "${YELLOW}Please check requirements.txt file${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Check if we're in the right directory
if [ ! -f "backend/manage.py" ]; then
    echo -e "${RED}❌ manage.py not found in backend directory${NC}"
    echo -e "${YELLOW}Please run this script from the project root directory${NC}"
    exit 1
fi

# Navigate to backend
cd backend

# Make migrations for all apps (including new organizations app)
echo -e "\n${PURPLE}🗄️  Creating database migrations...${NC}"
echo -e "${CYAN}  📋 Making migrations for core app...${NC}"
python manage.py makemigrations core --name="multi_tenant_architecture" > /dev/null 2>&1
echo -e "${CYAN}  📋 Making migrations for organizations app...${NC}"
python manage.py makemigrations organizations --name="initial_organizations" > /dev/null 2>&1
echo -e "${CYAN}  📋 Making migrations for menu app...${NC}"
python manage.py makemigrations menu --name="multi_tenant_menu" > /dev/null 2>&1
echo -e "${CYAN}  📋 Making migrations for bookings app...${NC}"
python manage.py makemigrations bookings --name="multi_tenant_bookings" > /dev/null 2>&1
echo -e "${CYAN}  📋 Making migrations for pricing app...${NC}"
python manage.py makemigrations pricing --name="multi_tenant_pricing" > /dev/null 2>&1

# Run all migrations
echo -e "\n${PURPLE}🔄 Applying database migrations...${NC}"
python manage.py migrate --run-syncdb > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database migrations failed${NC}"
    echo -e "${YELLOW}This might be due to model changes. You may need to:${NC}"
    echo -e "${YELLOW}1. Delete db.sqlite3 file${NC}"
    echo -e "${YELLOW}2. Delete migration files in apps/*/migrations/ (except __init__.py)${NC}"
    echo -e "${YELLOW}3. Run this script again${NC}"
    read -p "Do you want to reset the database? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}🗑️  Resetting database...${NC}"
        rm -f db.sqlite3
        find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
        find . -path "*/migrations/*.pyc" -delete
        echo -e "${CYAN}📋 Creating fresh migrations...${NC}"
        python manage.py makemigrations core > /dev/null 2>&1
        python manage.py makemigrations menu > /dev/null 2>&1
        python manage.py makemigrations bookings > /dev/null 2>&1
        python manage.py makemigrations pricing > /dev/null 2>&1
        echo -e "${CYAN}🔄 Applying fresh migrations...${NC}"
        python manage.py migrate > /dev/null 2>&1
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Fresh migrations also failed. Please check your models.${NC}"
            exit 1
        fi
    else
        exit 1
    fi
fi
echo -e "${GREEN}✅ Database migrations completed${NC}"

# Create platform admin superuser
echo -e "\n${PURPLE}👤 Setting up platform administrator...${NC}"
python manage.py shell -c "
from django.contrib.auth import get_user_model
from apps.core.models import UserProfile, PlatformSettings
User = get_user_model()

try:
    # Create platform admin if doesn't exist
    if not User.objects.filter(is_superuser=True).exists():
        print('Creating platform administrator...')
        admin_user = User.objects.create_superuser('admin', 'admin@marqueebooking.com', 'admin123')

        # Update user profile to platform admin
        profile, created = UserProfile.objects.get_or_create(user=admin_user)
        profile.user_type = 'platform_admin'
        profile.save()

        print('✅ Platform admin created: admin/admin123')
    else:
        admin_user = User.objects.filter(is_superuser=True).first()
        profile, created = UserProfile.objects.get_or_create(user=admin_user)
        if profile.user_type != 'platform_admin':
            profile.user_type = 'platform_admin'
            profile.save()
            print('✅ Platform admin profile updated')
        else:
            print('✅ Platform admin already exists')

    # Create default platform settings
    settings, created = PlatformSettings.objects.get_or_create()
    if created:
        print('✅ Default platform settings created')
    else:
        print('✅ Platform settings already exist')
except Exception as e:
    print(f'Error setting up admin: {e}')
" 2>/dev/null

# Create sample venue owner and organization
echo -e "\n${PURPLE}🏢 Setting up sample data...${NC}"
python manage.py shell -c "
from django.contrib.auth import get_user_model
from apps.core.models import UserProfile, Organization, Hall, DiscountTier
from apps.menu.models import MenuCategory, MenuItem
from decimal import Decimal
import uuid

User = get_user_model()

# Create sample venue owner
venue_owner, created = User.objects.get_or_create(
    username='venue_owner',
    defaults={
        'first_name': 'Ahmed',
        'last_name': 'Khan',
        'email': 'ahmed@sultanatmarquee.com',
        'is_staff': False
    }
)

if created:
    venue_owner.set_password('owner123')
    venue_owner.save()
    print('✅ Sample venue owner created: venue_owner/owner123')

# Update profile to venue owner
profile, created = UserProfile.objects.get_or_create(user=venue_owner)
if profile.user_type != 'venue_owner':
    profile.user_type = 'venue_owner'
    profile.phone = '+92-300-1234567'
    profile.city = 'Quetta'
    profile.save()

# Create sample organization
org, created = Organization.objects.get_or_create(
    name='Sultanat Marquee',
    defaults={
        'slug': 'sultanat-marquee',
        'description': 'Premium wedding and event venue in Quetta with traditional elegance',
        'email': 'info@sultanatmarquee.com',
        'phone': '+92-300-1234567',
        'address': 'Cantonment Area, Quetta',
        'city': 'Quetta',
        'state': 'Balochistan',
        'postal_code': '87300',
        'country': 'Pakistan',
        'owner': venue_owner,
        'status': 'active',
        'subscription_plan': 'premium'
    }
)

if created:
    print('✅ Sample organization created: Sultanat Marquee')

    # Create sample halls
    hall1 = Hall.objects.create(
        organization=org,
        name='Grand Ballroom',
        slug='grand-ballroom',
        description='Elegant indoor ballroom perfect for weddings and formal events',
        hall_type='banquet',
        capacity=500,
        base_price=Decimal('45000.00'),
        amenities='parking,ac,kitchen,sound,stage',
        has_parking=True,
        has_ac=True,
        has_kitchen=True,
        has_sound_system=True,
        has_stage=True,
        is_active=True
    )

    hall2 = Hall.objects.create(
        organization=org,
        name='Garden Lawn',
        slug='garden-lawn',
        description='Beautiful outdoor garden setting for intimate celebrations',
        hall_type='garden',
        capacity=300,
        base_price=Decimal('25000.00'),
        amenities='parking,sound',
        has_parking=True,
        has_sound_system=True,
        is_active=True
    )
    print('✅ Sample halls created')

    # Create discount tiers for the organization
    tiers = [
        ('Small Event', 1, 50, Decimal('0.00')),
        ('Medium Event', 51, 150, Decimal('5.00')),
        ('Large Event', 151, 300, Decimal('10.00')),
        ('Premium Event', 301, 500, Decimal('15.00')),
    ]

    for name, min_guests, max_guests, discount in tiers:
        DiscountTier.objects.get_or_create(
            organization=org,
            name=name,
            defaults={
                'min_guests': min_guests,
                'max_guests': max_guests,
                'discount_percentage': discount
            }
        )
    print('✅ Discount tiers created')

    # Create sample menu categories and items
    categories_data = [
        ('Appetizers', 'Starters and light bites', 1),
        ('Main Course', 'Primary dishes and entrees', 2),
        ('Rice & Bread', 'Staple accompaniments', 3),
        ('Desserts', 'Sweet treats and traditional desserts', 4),
        ('Beverages', 'Drinks and refreshments', 5)
    ]

    categories = {}
    for name, desc, order in categories_data:
        cat, created = MenuCategory.objects.get_or_create(
            organization=org,
            name=name,
            defaults={
                'description': desc,
                'display_order': order
            }
        )
        categories[name] = cat

    # Sample menu items
    menu_items_data = [
        ('Chicken Tikka', 'Appetizers', 'Grilled chicken with aromatic spices', Decimal('1200.00'), 'per_plate'),
        ('Seekh Kebab', 'Appetizers', 'Spiced minced meat kebabs', Decimal('1000.00'), 'per_plate'),
        ('Chicken Karahi', 'Main Course', 'Traditional chicken curry', Decimal('2000.00'), 'per_kg'),
        ('Mutton Korma', 'Main Course', 'Tender mutton in rich gravy', Decimal('3500.00'), 'per_kg'),
        ('Chicken Biryani', 'Rice & Bread', 'Aromatic basmati rice with chicken', Decimal('2500.00'), 'per_kg'),
        ('Naan Bread', 'Rice & Bread', 'Fresh oven-baked bread', Decimal('150.00'), 'per_piece'),
        ('Gulab Jamun', 'Desserts', 'Sweet milk dumplings', Decimal('100.00'), 'per_piece'),
        ('Fresh Juice', 'Beverages', 'Seasonal fresh fruit juice', Decimal('250.00'), 'per_plate'),
    ]

    for name, cat_name, desc, price, serving in menu_items_data:
        MenuItem.objects.get_or_create(
            organization=org,
            category=categories[cat_name],
            name=name,
            defaults={
                'description': desc,
                'base_price': price,
                'serving_type': serving,
                'dietary_type': 'regular',
                'is_available': True
            }
        )

    print('✅ Sample menu created')

# Create sample customer
customer, created = User.objects.get_or_create(
    username='customer',
    defaults={
        'first_name': 'Sara',
        'last_name': 'Ahmed',
        'email': 'sara@example.com'
    }
)

if created:
    customer.set_password('customer123')
    customer.save()

    # Update profile
    profile, created = UserProfile.objects.get_or_create(user=customer)
    profile.user_type = 'customer'
    profile.phone = '+92-301-9876543'
    profile.city = 'Karachi'
    profile.save()
    print('✅ Sample customer created: customer/customer123')

print('✅ Sample data setup completed')
" 2>/dev/null

# Check frontend dependencies
echo -e "\n${PURPLE}📦 Checking frontend dependencies...${NC}"
cd ../frontend

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ and npm${NC}"
    echo -e "${YELLOW}Visit: https://nodejs.org/${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ required. Current version: $(node --version)${NC}"
    exit 1
fi

if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies (this may take a moment)...${NC}"
    npm install --silent
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${CYAN}📦 Checking for updated dependencies...${NC}"
    npm ci --silent > /dev/null 2>&1
fi
echo -e "${GREEN}✅ Frontend dependencies ready${NC}"

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Multi-Tenant Marquee Platform Ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Start Django backend server
echo -e "\n${PURPLE}🐍 Starting Django Backend Server (Port 8000)...${NC}"
cd ../backend
python manage.py runserver 2>&1 | sed 's/^/[BACKEND] /' &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to initialize...${NC}"
sleep 3



# Start Next.js frontend server
echo -e "\n${PURPLE}⚛️  Starting Next.js Frontend Server (Port 3000)...${NC}"
cd ../frontend
npm run dev 2>&1 | sed 's/^/[FRONTEND] /' &
FRONTEND_PID=$!

# Wait a moment for frontend to start
echo -e "${YELLOW}⏳ Waiting for frontend to initialize...${NC}"
sleep 5



echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 MULTI-TENANT MARQUEE PLATFORM IS LIVE! 🎉${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e ""
echo -e "${CYAN}📱 CUSTOMER EXPERIENCE:${NC}"
echo -e "${BLUE}🏠 Homepage:          ${NC}http://localhost:3000"
echo -e "${BLUE}🏪 Marketplace:       ${NC}http://localhost:3000/marketplace"
echo -e "${BLUE}📝 Customer Login:    ${NC}http://localhost:3000/auth/login"
echo -e "${BLUE}👤 Test Customer:     ${NC}customer / customer123"
echo -e ""
echo -e "${PURPLE}🏢 VENUE OWNER EXPERIENCE:${NC}"
echo -e "${BLUE}📋 Become Partner:    ${NC}http://localhost:3000/become-partner"
echo -e "${BLUE}🎛️  Venue Dashboard:   ${NC}http://localhost:3000/admin"
echo -e "${BLUE}🔑 Venue Owner Login: ${NC}venue_owner / owner123"
echo -e ""
echo -e "${GREEN}⚙️  PLATFORM ADMIN:${NC}"
echo -e "${BLUE}🖥️  Django Admin:      ${NC}http://localhost:8000/admin"
echo -e "${BLUE}👨‍💼 Platform Admin:    ${NC}admin / admin123"
echo -e "${BLUE}📊 Backend API:       ${NC}http://localhost:8000/api/"
echo -e ""
echo -e "${YELLOW}🎯 SAMPLE ORGANIZATION:${NC}"
echo -e "${CYAN}   Name: Sultanat Marquee (Quetta)${NC}"
echo -e "${CYAN}   Owner: Ahmed Khan (venue_owner)${NC}"
echo -e "${CYAN}   Halls: Grand Ballroom (500 capacity), Garden Lawn (300 capacity)${NC}"
echo -e "${CYAN}   Status: Active with sample menu items${NC}"
echo -e ""
echo -e "${GREEN}🚀 PLATFORM FEATURES:${NC}"
echo -e "${CYAN}   ✅ Multi-tenant architecture${NC}"
echo -e "${CYAN}   ✅ Organization management${NC}"
echo -e "${CYAN}   ✅ Marketplace for customers${NC}"
echo -e "${CYAN}   ✅ Venue owner onboarding${NC}"
echo -e "${CYAN}   ✅ Platform administration${NC}"
echo -e "${CYAN}   ✅ Advanced permissions${NC}"
echo -e "${CYAN}   ✅ Commission-based revenue${NC}"
echo -e ""
echo -e "${RED}Press Ctrl+C to stop all servers${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Wait for all background processes
wait
