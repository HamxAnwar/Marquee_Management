#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Marquee Management System Development Servers${NC}"
echo -e "${BLUE}📁 Project Directory: $(pwd)${NC}"

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down development servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start Django backend server
echo -e "\n${GREEN}🐍 Starting Django Backend (Port 8000)...${NC}"
cd backend
python manage.py runserver &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start Next.js frontend server
echo -e "\n${GREEN}⚛️  Starting Next.js Frontend (Port 3000)...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo -e "\n${YELLOW}✅ Both servers are starting up!${NC}"
echo -e "${BLUE}🔗 Backend API: http://localhost:8000${NC}"
echo -e "${BLUE}🌐 Frontend App: http://localhost:3000${NC}"
echo -e "${YELLOW}📝 Admin Login: http://localhost:3000/admin/login${NC}"
echo -e "${YELLOW}👤 Test Credentials: admin / admin123${NC}"
echo -e "\n${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Wait for all background processes
wait