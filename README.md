# 🏰 Marquee Management System

A comprehensive full-stack web application for managing marquee bookings, events, and catering services. Built with Django REST Framework backend and a modern responsive interface.

**Company:** RoboSoft Innovations (SMC-Private) Limited  
**Initial Target:** Sultanat Marquee, Quetta

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication system
- Role-based access control (Admin, Manager, Staff, Customer)
- Secure token management with automatic refresh
- User profile management

### 🏛️ Hall Management
- Multiple venue/hall management with detailed configurations
- Capacity and pricing settings per hall
- Real-time availability checking
- Hall status management (active/inactive)
- Advanced booking conflict prevention

### 🍽️ Menu Management
- Categorized menu system with hierarchical organization
- Food item management with flexible pricing
- Vegetarian/non-vegetarian classification
- Menu item variants and availability control
- Bulk menu operations

### 📅 Booking System
- Complete event booking workflow with status tracking
- Customer information management
- Event type categorization (weddings, corporate, birthdays, etc.)
- Booking status tracking (pending, confirmed, cancelled, completed)
- Menu item selection and customization for events
- Conflict detection and resolution

### 💰 Pricing & Discounts
- Dynamic pricing calculation based on multiple factors
- Guest-based discount tiers with flexible rules
- Base pricing with modifiers and seasonal adjustments
- Real-time price quotes and budget optimization
- Advanced pricing engine with caching

### 👥 User Management
- Comprehensive user profile system
- Role assignment and permissions management
- Customer registration and profiles
- Staff and admin user management

### 📊 Admin Dashboard
- Real-time statistics and analytics
- Revenue tracking with detailed reports
- Booking analytics with interactive charts
- Quick action shortcuts and bulk operations
- System health monitoring

## 🛠️ Tech Stack

### Backend
- **Django 5.2.7** - High-level Python web framework
- **Django REST Framework** - Powerful toolkit for building APIs
- **JWT Authentication** - Token-based authentication with refresh
- **SQLite** - Database (easily configurable to PostgreSQL/MySQL)
- **Redis** - Caching and session management
- **CORS Headers** - Cross-origin resource sharing

### Frontend (Planned)
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Modern, accessible UI components
- **TanStack Query** - Data fetching, caching, and synchronization
- **React Hook Form** - Performant forms with easy validation
- **Zod** - Schema validation for TypeScript
- **Lucide React** - Beautiful, customizable icons

### Infrastructure
- **Docker** - Containerization for consistent deployments
- **Nginx** - High-performance web server and reverse proxy
- **PostgreSQL** - Production database
- **Redis** - Caching and background task queue

## 🚀 Getting Started

### Prerequisites
- Python 3.13+
- Node.js 18+ (for frontend development)
- Git
- Redis (optional, for caching)

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Marquee_Management
   ```

2. **Run the automated setup script**
   ```bash
   ./start_dev.sh
   ```

3. **Start the development server**
   ```bash
   cd backend
   source ../venv/bin/activate
   python manage.py runserver
   ```

### Manual Installation

1. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   # For fish shell: source venv/bin/activate.fish
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Configuration**
   
   Copy `.env.example` to `.env` and update the values:
   ```env
   # Django Settings
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   
   # Database (PostgreSQL for production)
   DB_NAME=marquee_db
   DB_USER=marquee_user
   DB_PASSWORD=marquee_password
   DB_HOST=localhost
   DB_PORT=5432
   
   # Redis Cache (optional)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_DB=0
   
   # JWT Settings
   JWT_ACCESS_TOKEN_LIFETIME=60  # minutes
   JWT_REFRESH_TOKEN_LIFETIME=7  # days
   ```

4. **Database setup**
   ```bash
   cd backend
   python manage.py migrate
   python manage.py createsuperuser
   ```

### 🌐 Access Points

- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin (admin/admin123)
- **API Documentation**: http://localhost:8000/api/docs/ (coming soon)

## 📁 Project Structure

```
Marquee_Management/
├── backend/                    # Django REST API
│   ├── marquee_system/        # Main Django project
│   │   ├── settings/          # Environment-specific settings
│   │   ├── urls.py           # URL routing
│   │   └── wsgi.py           # WSGI configuration
│   └── apps/                  # Django applications
│       ├── core/              # Core models (Hall, User, Discount)
│       │   ├── models.py     # Database models
│       │   ├── serializers.py # API serializers
│       │   ├── views.py      # API views
│       │   └── urls.py       # URL patterns
│       ├── menu/              # Menu management
│       │   ├── models.py     # Menu and category models
│       │   ├── serializers.py
│       │   └── views.py
│       ├── bookings/          # Booking system
│       │   ├── models.py     # Booking models
│       │   ├── serializers.py
│       │   ├── views.py
│       │   └── utils.py      # Booking utilities
│       └── pricing/           # Pricing engine
│           ├── models.py     # Pricing models
│           ├── calculators.py # Pricing algorithms
│           └── views.py
├── frontend/                  # Next.js frontend (planned)
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and configurations
│   │   ├── services/         # API service functions
│   │   └── types/            # TypeScript type definitions
│   ├── public/               # Static assets
│   └── package.json
├── infrastructure/           # Docker & deployment configs
│   ├── docker/
│   │   ├── Dockerfile.backend
│   │   └── docker-compose.yml
│   ├── nginx/
│   │   └── nginx.conf
│   └── scripts/
│       └── deploy.sh
├── docs/                     # Documentation
├── venv/                     # Python virtual environment
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables
├── start_dev.sh             # Development startup script
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login with credentials
- `POST /api/auth/token/` - Obtain JWT token pair
- `POST /api/auth/token/refresh/` - Refresh access token
- `GET /api/auth/user/` - Get current user profile
- `POST /api/auth/logout/` - Logout user

### Halls Management
- `GET /api/halls/` - List all halls with filtering
- `POST /api/halls/` - Create new hall
- `GET /api/halls/{id}/` - Get hall details
- `PUT /api/halls/{id}/` - Update hall information
- `DELETE /api/halls/{id}/` - Delete hall
- `GET /api/halls/{id}/availability/` - Check hall availability

### Menu Management
- `GET /api/menu/categories/` - List menu categories
- `POST /api/menu/categories/` - Create category
- `GET /api/menu/categories/{id}/` - Get category details
- `PUT /api/menu/categories/{id}/` - Update category
- `DELETE /api/menu/categories/{id}/` - Delete category
- `GET /api/menu/items/` - List menu items with filtering
- `POST /api/menu/items/` - Create menu item
- `GET /api/menu/items/{id}/` - Get item details
- `PUT /api/menu/items/{id}/` - Update item
- `DELETE /api/menu/items/{id}/` - Delete item

### Bookings
- `GET /api/bookings/` - List bookings with filtering
- `POST /api/bookings/` - Create new booking
- `GET /api/bookings/{id}/` - Get booking details
- `PUT /api/bookings/{id}/` - Update booking
- `DELETE /api/bookings/{id}/` - Cancel booking
- `POST /api/bookings/{id}/confirm/` - Confirm booking
- `POST /api/bookings/{id}/complete/` - Mark booking as completed

### Users Management
- `GET /api/users/` - List users (admin only)
- `POST /api/users/` - Create user
- `GET /api/users/{id}/` - Get user details
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

### Pricing
- `POST /api/pricing/calculate/` - Calculate pricing for booking
- `GET /api/pricing/discounts/` - List available discounts
- `POST /api/pricing/quote/` - Generate price quote

## 🔧 Development Commands

```bash
# Development environment
./start_dev.sh                    # Setup and start development environment

# Django management commands
cd backend
python manage.py runserver        # Start development server
python manage.py makemigrations   # Create database migrations
python manage.py migrate          # Apply migrations
python manage.py createsuperuser  # Create admin user
python manage.py shell            # Interactive Django shell
python manage.py collectstatic    # Collect static files
python manage.py test             # Run tests
python manage.py check            # Check for common issues

# Database operations
python manage.py dbshell          # Database shell
python manage.py dumpdata         # Export data
python manage.py loaddata         # Import data

# Custom management commands
python manage.py seed_data         # Populate with sample data
python manage.py clear_cache       # Clear Redis cache
```

## 🧪 Testing

```bash
# Run all tests
python manage.py test

# Run tests for specific app
python manage.py test apps.core
python manage.py test apps.bookings

# Run tests with coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

## 🚀 Deployment

### Docker Deployment (Recommended)

1. **Build and run with Docker Compose**
   ```bash
   docker-compose -f infrastructure/docker/docker-compose.yml up -d
   ```

2. **Production environment variables**
   ```env
   DEBUG=False
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   DATABASE_URL=postgres://user:password@db:5432/marquee_db
   REDIS_URL=redis://redis:6379/0
   ```

### Traditional Deployment

1. **Install dependencies and setup environment**
   ```bash
   pip install -r requirements.txt
   python manage.py collectstatic --noinput
   python manage.py migrate
   ```

2. **Configure web server (Nginx + Gunicorn)**
   ```bash
   gunicorn marquee_system.wsgi:application --bind 0.0.0.0:8000
   ```

## 📊 Monitoring & Analytics

The system includes comprehensive monitoring capabilities:

- **Performance Metrics**: Response times, database queries, cache hit rates
- **Business Metrics**: Bookings per day, revenue tracking, popular menu items
- **System Health**: Database connections, memory usage, error rates
- **User Analytics**: Login patterns, feature usage, conversion rates

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use type hints where appropriate
- Write comprehensive tests for new features
- Update documentation for API changes
- Use meaningful commit messages

## 📄 License

This project is proprietary software of RoboSoft Innovations (SMC-Private) Limited.

## 📞 Contact & Support

**RoboSoft Innovations (SMC-Private) Limited**  
Email: robosoftinnovations@outlook.com

For technical support or feature requests, please create an issue in the repository.

---

## 🎯 Roadmap

### Phase 1: Backend API (Current) ✅
- [x] Core models and database schema
- [x] RESTful API endpoints
- [x] JWT authentication system
- [x] Admin interface
- [x] Basic pricing engine

### Phase 2: Frontend Development (In Progress) 🔄
- [ ] Next.js application setup
- [ ] Authentication flow
- [ ] Booking interface
- [ ] Admin dashboard
- [ ] Responsive design

### Phase 3: Advanced Features 📋
- [ ] Real-time notifications
- [ ] Advanced reporting
- [ ] Payment integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics

### Phase 4: Production Deployment 🚀
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Production monitoring
- [ ] Performance optimization
- [ ] Security hardening

---

**Made with ❤️ for efficient marquee and event management**

*Last updated: December 2024*
