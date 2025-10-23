#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Marquee Management System Development Environment${NC}"
echo -e "${BLUE}📁 Project Directory: $(pwd)${NC}"

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down development servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment not found. Creating venv...${NC}"
    python -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to create virtual environment. Please install python3-venv${NC}"
        exit 1
    fi
fi

# Activate virtual environment
echo -e "\n${GREEN}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

# Install/update backend dependencies
echo -e "\n${GREEN}📦 Installing/updating backend dependencies...${NC}"
pip install -q -r requirements.txt

# Run Django migrations
echo -e "\n${GREEN}🗄️  Running database migrations...${NC}"
cd backend
python manage.py migrate --no-input

# Create superuser if it doesn't exist
echo -e "\n${GREEN}👤 Checking for superuser...${NC}"
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    print('Creating superuser...')
    User.objects.create_superuser('admin', 'admin@marquee.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
" 2>/dev/null

# Install frontend dependencies if needed
echo -e "\n${GREEN}📦 Checking frontend dependencies...${NC}"
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies (this may take a moment)...${NC}"
    npm install --silent
fi

echo -e "\n${GREEN}✅ Development environment ready!${NC}"

# Start Django backend server
echo -e "\n${GREEN}🐍 Starting Django Backend (Port 8000)...${NC}"
cd ../backend
python manage.py runserver &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start Next.js frontend server
echo -e "\n${GREEN}⚛️  Starting Next.js Frontend (Port 3000)...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Both servers are running!${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔗 Backend API:    ${NC}http://localhost:8000"
echo -e "${BLUE}🌐 Frontend App:   ${NC}http://localhost:3000"
echo -e "${BLUE}👨‍💼 Admin Panel:    ${NC}http://localhost:8000/admin"
echo -e "${BLUE}📝 Admin Login:    ${NC}http://localhost:3000/admin/login"
echo -e "${YELLOW}👤 Test Credentials: ${NC}admin / admin123"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}Press Ctrl+C to stop both servers${NC}"

# Wait for all background processes
wait
