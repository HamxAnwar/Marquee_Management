# Database Setup Guide

This guide explains how to configure different databases for the Marquee Management System.

## 🗄️ Database Options

The application supports multiple database backends with environment-based configuration:

### 1. SQLite (Default - Development)

**Perfect for:** Development, testing, quick prototyping

**Advantages:**
- Zero setup required
- Fast for small datasets
- No external dependencies
- Easy database resets

**Configuration:**
```env
# .env file - No database variables needed
# SQLite is used by default
```

**No additional setup required!** Just run migrations:
```bash
python manage.py migrate
```

### 2. PostgreSQL (Recommended - Production)

**Perfect for:** Production, staging, high-traffic applications

**Advantages:**
- Excellent performance with concurrent users
- Advanced features (JSON, full-text search, etc.)
- ACID compliance and data integrity
- Horizontal scaling support

#### Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Arch Linux:**
```bash
sudo pacman -S postgresql
sudo -u postgres initdb -D /var/lib/postgres/data
sudo systemctl enable --now postgresql
```

#### Setup

1. **Create database and user:**
```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE marquee_db;
CREATE USER marquee_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE marquee_db TO marquee_user;
ALTER USER marquee_user CREATEDB;  -- For running tests
\q
```

2. **Configure environment:**
```env
# .env file
DB_ENGINE=postgresql
DB_NAME=marquee_db
DB_USER=marquee_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
```

3. **Run migrations:**
```bash
python manage.py migrate
```

### 3. MySQL (Alternative)

**Perfect for:** Teams familiar with MySQL, existing MySQL infrastructure

#### Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server mysql-client
sudo mysql_secure_installation
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

#### Setup

1. **Create database and user:**
```bash
mysql -u root -p
```

```sql
CREATE DATABASE marquee_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'marquee_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON marquee_db.* TO 'marquee_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

2. **Configure environment:**
```env
# .env file
DB_ENGINE=mysql
DB_NAME=marquee_db
DB_USER=marquee_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=3306
```

3. **Run migrations:**
```bash
python manage.py migrate
```

### 4. Database URL (Production)

**Perfect for:** Cloud deployments, managed databases, Docker

Use this format for production environments with managed databases:

```env
# PostgreSQL
DATABASE_URL=postgres://user:password@host:port/database

# MySQL
DATABASE_URL=mysql://user:password@host:port/database

# Examples:
DATABASE_URL=postgres://marquee_user:password@localhost:5432/marquee_db
DATABASE_URL=postgres://user:pass@rds.amazonaws.com:5432/prod_db
```

## 🐳 Docker Database Setup

### PostgreSQL with Docker

```bash
# Run PostgreSQL container
docker run --name marquee-postgres \
  -e POSTGRES_DB=marquee_db \
  -e POSTGRES_USER=marquee_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -d postgres:15

# Configure environment
echo "DB_ENGINE=postgresql" >> .env
echo "DB_NAME=marquee_db" >> .env
echo "DB_USER=marquee_user" >> .env
echo "DB_PASSWORD=your_secure_password" >> .env
```

### MySQL with Docker

```bash
# Run MySQL container
docker run --name marquee-mysql \
  -e MYSQL_DATABASE=marquee_db \
  -e MYSQL_USER=marquee_user \
  -e MYSQL_PASSWORD=your_secure_password \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -p 3306:3306 \
  -d mysql:8.0

# Configure environment
echo "DB_ENGINE=mysql" >> .env
echo "DB_NAME=marquee_db" >> .env
echo "DB_USER=marquee_user" >> .env
echo "DB_PASSWORD=your_secure_password" >> .env
```

## 🔧 Common Tasks

### Database Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Check migration status
python manage.py showmigrations
```

### Database Reset

**SQLite:**
```bash
rm backend/db.sqlite3
python manage.py migrate
```

**PostgreSQL/MySQL:**
```bash
python manage.py flush  # Removes all data
# OR drop and recreate database, then migrate
```

### Backup and Restore

**SQLite:**
```bash
# Backup
cp backend/db.sqlite3 backup_$(date +%Y%m%d).sqlite3

# Restore
cp backup_20241221.sqlite3 backend/db.sqlite3
```

**PostgreSQL:**
```bash
# Backup
pg_dump -U marquee_user -h localhost marquee_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U marquee_user -h localhost marquee_db < backup_20241221.sql
```

## ⚡ Performance Tips

### PostgreSQL Optimization

Add these settings to PostgreSQL configuration for better performance:

```sql
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

### Connection Pooling

For production, consider using connection pooling:

```bash
pip install django-db-pool
```

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'dj_db_pool.backends.postgresql',
        # ... other settings
        'POOL_OPTIONS': {
            'POOL_SIZE': 20,
            'MAX_OVERFLOW': 30,
        }
    }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Connection refused:**
   - Check if database service is running
   - Verify host and port settings
   - Check firewall settings

2. **Authentication failed:**
   - Verify username and password
   - Check user permissions
   - Ensure user can connect from the specified host

3. **Database doesn't exist:**
   - Create the database first
   - Check database name spelling

4. **Migration errors:**
   - Check database permissions
   - Ensure database is accessible
   - Try running migrations individually

### Testing Database Configuration

```bash
# Test database connection
python manage.py dbshell

# Check current database
python manage.py shell
>>> from django.db import connection
>>> print(connection.vendor)
>>> print(connection.settings_dict)
```

## 🚀 Deployment Considerations

### Development → Production Migration

1. **Export data from SQLite:**
```bash
python manage.py dumpdata --natural-foreign --natural-primary > data.json
```

2. **Configure production database**

3. **Import data to production:**
```bash
python manage.py loaddata data.json
```

### Environment-specific Settings

Create separate environment files:
- `.env.development` - SQLite configuration
- `.env.staging` - PostgreSQL with staging database
- `.env.production` - PostgreSQL with production database

## 📊 Monitoring

Monitor database performance in production:

```python
# Add to settings.py for development
if DEBUG:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
            },
        },
        'loggers': {
            'django.db.backends': {
                'handlers': ['console'],
                'level': 'DEBUG',
            },
        },
    }
```

This configuration provides maximum flexibility while maintaining simplicity for development and robustness for production deployments.