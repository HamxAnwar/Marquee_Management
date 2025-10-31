#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking System Requirements for Marquee Management System${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"

# Function to check command existence
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 is installed${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 is not installed${NC}"
        return 1
    fi
}

# Function to check version
check_version() {
    local cmd=$1
    local version_flag=$2
    local min_version=$3
    local current_version=$($cmd $version_flag 2>/dev/null | head -n1)

    if [ ! -z "$current_version" ]; then
        echo -e "${CYAN}   Version: $current_version${NC}"
        return 0
    else
        echo -e "${YELLOW}   Version: Could not determine${NC}"
        return 1
    fi
}

# Check Python
echo -e "\n${PURPLE}🐍 Python Environment:${NC}"
if check_command python3; then
    check_version python3 --version
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)

    if [ "$PYTHON_MAJOR" -ge 3 ] && [ "$PYTHON_MINOR" -ge 8 ]; then
        echo -e "${GREEN}   ✅ Python version is compatible (3.8+)${NC}"
    else
        echo -e "${RED}   ❌ Python 3.8+ required, found $PYTHON_VERSION${NC}"
    fi
elif check_command python; then
    check_version python --version
    echo -e "${YELLOW}   ⚠️  Consider using python3 instead of python${NC}"
else
    echo -e "${RED}   ❌ Python is not installed${NC}"
    echo -e "${YELLOW}   Install: sudo apt install python3 python3-pip (Ubuntu/Debian)${NC}"
    echo -e "${YELLOW}   Install: brew install python (macOS)${NC}"
fi

# Check pip
echo -e "\n${PURPLE}📦 Python Package Manager:${NC}"
if check_command pip3; then
    check_version pip3 --version
elif check_command pip; then
    check_version pip --version
else
    echo -e "${RED}   ❌ pip is not installed${NC}"
    echo -e "${YELLOW}   Install: sudo apt install python3-pip (Ubuntu/Debian)${NC}"
fi

# Check virtual environment
echo -e "\n${PURPLE}🏠 Virtual Environment:${NC}"
if python3 -m venv --help &>/dev/null; then
    echo -e "${GREEN}✅ python3-venv is available${NC}"
else
    echo -e "${RED}❌ python3-venv is not available${NC}"
    echo -e "${YELLOW}   Install: sudo apt install python3-venv (Ubuntu/Debian)${NC}"
fi

# Check if venv exists
if [ -d "venv" ]; then
    echo -e "${GREEN}✅ Virtual environment directory exists${NC}"
else
    echo -e "${YELLOW}⚠️  Virtual environment not found (will be created automatically)${NC}"
fi

# Check Node.js
echo -e "\n${PURPLE}🟢 Node.js Environment:${NC}"
if check_command node; then
    check_version node --version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo -e "${GREEN}   ✅ Node.js version is compatible (18+)${NC}"
    else
        echo -e "${RED}   ❌ Node.js 18+ required, found v$NODE_VERSION${NC}"
    fi
else
    echo -e "${RED}   ❌ Node.js is not installed${NC}"
    echo -e "${YELLOW}   Install: https://nodejs.org/${NC}"
    echo -e "${YELLOW}   Install: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -${NC}"
    echo -e "${YELLOW}   Install: sudo apt-get install -y nodejs (Ubuntu/Debian)${NC}"
    echo -e "${YELLOW}   Install: brew install node (macOS)${NC}"
fi

# Check npm
echo -e "\n${PURPLE}📦 Node Package Manager:${NC}"
if check_command npm; then
    check_version npm --version
else
    echo -e "${RED}   ❌ npm is not installed${NC}"
    echo -e "${YELLOW}   Usually comes with Node.js installation${NC}"
fi

# Check Git
echo -e "\n${PURPLE}🔧 Version Control:${NC}"
if check_command git; then
    check_version git --version
else
    echo -e "${RED}   ❌ git is not installed${NC}"
    echo -e "${YELLOW}   Install: sudo apt install git (Ubuntu/Debian)${NC}"
    echo -e "${YELLOW}   Install: brew install git (macOS)${NC}"
fi

# Check database options
echo -e "\n${PURPLE}🗄️  Database Options:${NC}"
echo -e "${GREEN}✅ SQLite (built-in with Python)${NC}"

if check_command psql; then
    echo -e "${GREEN}✅ PostgreSQL client available${NC}"
    check_version psql --version
else
    echo -e "${YELLOW}⚠️  PostgreSQL not found (optional for production)${NC}"
    echo -e "${CYAN}   Install: sudo apt install postgresql postgresql-contrib (Ubuntu/Debian)${NC}"
    echo -e "${CYAN}   Install: brew install postgresql (macOS)${NC}"
fi

if check_command mysql; then
    echo -e "${GREEN}✅ MySQL client available${NC}"
    check_version mysql --version
else
    echo -e "${YELLOW}⚠️  MySQL not found (optional alternative)${NC}"
    echo -e "${CYAN}   Install: sudo apt install mysql-server (Ubuntu/Debian)${NC}"
    echo -e "${CYAN}   Install: brew install mysql (macOS)${NC}"
fi

# Check Redis (optional)
echo -e "\n${PURPLE}⚡ Caching (Optional):${NC}"
if check_command redis-server; then
    echo -e "${GREEN}✅ Redis server available${NC}"
    check_version redis-server --version
elif check_command redis-cli; then
    echo -e "${GREEN}✅ Redis client available${NC}"
    check_version redis-cli --version
else
    echo -e "${YELLOW}⚠️  Redis not found (optional for caching)${NC}"
    echo -e "${CYAN}   Install: sudo apt install redis-server (Ubuntu/Debian)${NC}"
    echo -e "${CYAN}   Install: brew install redis (macOS)${NC}"
fi

# Check project files
echo -e "\n${PURPLE}📁 Project Structure:${NC}"
required_files=(
    "requirements.txt"
    "backend/manage.py"
    "frontend/package.json"
    "start-dev.sh"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file not found${NC}"
    fi
done

# Check project directories
required_dirs=(
    "backend"
    "frontend"
    "backend/apps"
    "backend/apps/core"
    "backend/apps/menu"
    "backend/apps/bookings"
    "backend/apps/pricing"
    "backend/apps/organizations"
    "frontend/src"
)

for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ $dir/ directory exists${NC}"
    else
        echo -e "${RED}❌ $dir/ directory not found${NC}"
    fi
done

# Summary
echo -e "\n${PURPLE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📋 Summary:${NC}"

# Count missing requirements
missing_count=0

# Essential requirements check
if ! command -v python3 &> /dev/null; then
    ((missing_count++))
fi

if ! python3 -m venv --help &>/dev/null; then
    ((missing_count++))
fi

if ! command -v node &> /dev/null; then
    ((missing_count++))
fi

if ! command -v npm &> /dev/null; then
    ((missing_count++))
fi

if [ $missing_count -eq 0 ]; then
    echo -e "${GREEN}✅ All essential requirements are met!${NC}"
    echo -e "${GREEN}🚀 You can run ./start-dev.sh to start the application${NC}"
else
    echo -e "${RED}❌ $missing_count essential requirement(s) missing${NC}"
    echo -e "${YELLOW}Please install missing requirements before running the application${NC}"
fi

# Operating system specific notes
echo -e "\n${CYAN}💡 Platform-specific installation commands:${NC}"
echo -e "${YELLOW}Ubuntu/Debian:${NC}"
echo -e "  sudo apt update"
echo -e "  sudo apt install python3 python3-pip python3-venv nodejs npm git"

echo -e "\n${YELLOW}macOS (with Homebrew):${NC}"
echo -e "  brew install python@3.11 node npm git"

echo -e "\n${YELLOW}Windows (with Chocolatey):${NC}"
echo -e "  choco install python nodejs npm git"

echo -e "\n${GREEN}🎯 Next Steps:${NC}"
echo -e "1. Install any missing requirements"
echo -e "2. Run ${CYAN}./start-dev.sh${NC} to start the development environment"
echo -e "3. If you encounter migration issues, run ${CYAN}./reset-db.sh${NC}"

echo -e "\n${PURPLE}═══════════════════════════════════════════════════════════${NC}"
