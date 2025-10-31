#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${RED}🗑️  Database Reset Script${NC}"
echo -e "${YELLOW}This will delete your database and all data!${NC}"
echo -e "${YELLOW}This is useful for development when models change significantly.${NC}"
echo ""

# Confirm action
read -p "Are you sure you want to reset the database? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Operation cancelled.${NC}"
    exit 0
fi

echo -e "${RED}⚠️  WARNING: This will delete ALL data!${NC}"
read -p "Type 'YES' to confirm: " CONFIRM
if [ "$CONFIRM" != "YES" ]; then
    echo -e "${GREEN}Operation cancelled.${NC}"
    exit 0
fi

echo -e "\n${PURPLE}🔥 Resetting database...${NC}"

# Stop any running Django processes
echo -e "${YELLOW}Stopping Django processes...${NC}"
pkill -f "python.*manage.py.*runserver" 2>/dev/null

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo -e "${BLUE}Activating virtual environment...${NC}"
    source venv/bin/activate
fi

# Navigate to backend directory
cd backend

# Remove database file
echo -e "${RED}Removing database file...${NC}"
rm -f db.sqlite3

# Remove all migration files except __init__.py
echo -e "${RED}Removing migration files...${NC}"
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete 2>/dev/null
find . -path "*/migrations/*.pyc" -delete 2>/dev/null
find . -path "*/migrations/__pycache__" -type d -exec rm -rf {} + 2>/dev/null

echo -e "\n${BLUE}Creating fresh migrations...${NC}"

# Create new migrations for each app
echo -e "${PURPLE}Creating core migrations...${NC}"
python manage.py makemigrations core --name="initial_core"

echo -e "${PURPLE}Creating organizations migrations...${NC}"
python manage.py makemigrations organizations --name="initial_organizations"

echo -e "${PURPLE}Creating menu migrations...${NC}"
python manage.py makemigrations menu --name="initial_menu"

echo -e "${PURPLE}Creating bookings migrations...${NC}"
python manage.py makemigrations bookings --name="initial_bookings"

echo -e "${PURPLE}Creating pricing migrations...${NC}"
python manage.py makemigrations pricing --name="initial_pricing"

# Apply migrations
echo -e "\n${BLUE}Applying migrations...${NC}"
python manage.py migrate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Migration failed!${NC}"
    echo -e "${YELLOW}Please check your models for errors.${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ Database reset completed successfully!${NC}"
echo -e "${YELLOW}You can now run ./start-dev.sh to start the application with fresh data.${NC}"

# Return to project root
cd ..

echo -e "${GREEN}🎉 Ready to start fresh!${NC}"
