#!/bin/bash

# Marquee System Development Startup Script
echo "🎪 Starting Marquee Booking System Development Environment..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Run: python -m venv venv"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run Django migrations
echo "🗄️ Running database migrations..."
cd backend
python manage.py migrate

# Create superuser if it doesn't exist
echo "👤 Checking for superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    print('Creating superuser...')
    User.objects.create_superuser('admin', 'admin@marquee.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
"

echo "✅ Development environment ready!"
echo "🚀 Start Django server: cd backend && python manage.py runserver"
echo "🌐 Admin panel: http://localhost:8000/admin (admin/admin123)"
echo "📚 API docs will be available at: http://localhost:8000/api/"