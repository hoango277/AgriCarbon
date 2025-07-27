# AgriCarbon Docker Setup

Hướng dẫn setup và chạy dự án AgriCarbon bằng Docker.

## 📋 Yêu cầu hệ thống

- Docker Engine 20.10+
- Docker Compose 2.0+
- Ít nhất 4GB RAM
- 10GB dung lượng trống

## 🚀 Quick Start

```bash
# Clone repository
git clone <repository-url>
cd agricarbon

# Build và chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng tất cả services
docker-compose down
```

## 🌐 Truy cập ứng dụng

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:3306

## 📦 Services

### Database (MySQL 8.0)
- **Container**: `agricarbon_db`
- **Port**: 3306
- **Database**: overrun
- **User**: root
- **Password**: hoa0976271476

### Backend (FastAPI)
- **Container**: `agricarbon_backend`
- **Port**: 8000
- **API Docs**: `/docs`

### Frontend (React + Nginx)
- **Container**: `agricarbon_frontend`
- **Port**: 80

## 🔧 Useful Commands

### Docker Compose Commands

```bash
# Build tất cả images
docker-compose build

# Build specific service
docker-compose build backend

# Chạy chỉ database
docker-compose up -d database

# Scale service
docker-compose up -d --scale backend=2

# Xem status
docker-compose ps

# Stop và remove containers
docker-compose down

# Remove volumes (xóa data)
docker-compose down -v
```

### Container Management

```bash
# Access container shell
docker exec -it agricarbon_backend bash
docker exec -it agricarbon_frontend sh

# View container logs
docker logs agricarbon_backend -f

# Restart service
docker-compose restart backend

# Update service
docker-compose pull
docker-compose up -d
```

### Database Commands

```bash
# Connect to database
docker exec -it agricarbon_db mysql -u root -p

# Backup database
docker exec agricarbon_db mysqldump -u root -p overrun > backup.sql

# Restore database
docker exec -i agricarbon_db mysql -u root -p overrun < backup.sql
```

## 🔒 Environment Variables

### Backend (.env)
```env
DATABASE_URL=mysql+pymysql://root:hoa0976271476@database/overrun
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## 🛠️ Development Workflow

### Local Development
```bash
# Start only database
docker-compose up -d database

# Run backend locally
cd BE
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Run frontend locally (in another terminal)
cd FE  
npm install
npm run dev
```

## 🔍 Troubleshooting

### Port Conflicts
```bash
# Check what's using the port
netstat -tulpn | grep :8000

# Kill process using port
sudo kill -9 $(lsof -t -i:8000)
```

### Container Issues
```bash
# Remove all containers
docker-compose down --remove-orphans

# Rebuild from scratch
docker-compose build --no-cache

# Clean up Docker system
docker system prune -a
```

### Upload Issues (413 Request Entity Too Large)
```bash
# If getting 413 errors for image uploads, check nginx logs
docker logs agricarbon_frontend

# The nginx.conf is configured for 50MB uploads
# If you need larger limits, edit FE/nginx.conf:
# client_max_body_size 100M;

# Then rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Database Connection Issues
```bash
# Check database status
docker-compose exec database mysqladmin ping -h localhost -u root -p

# Reset database
docker-compose down
docker volume rm agricarbon_mysql_data
docker-compose up -d
```

## 📊 Monitoring

### Service Status
```bash
# Check all services status
docker-compose ps

# Check backend API
curl http://localhost:8000/
```

### Logs
```bash
# All services logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 frontend
```

## 🚀 Production Deployment

### With SSL (Optional)
```bash
# Enable nginx proxy with SSL
docker-compose --profile production up -d

# Add SSL certificates to ./nginx/ssl/
# - cert.pem
# - key.pem
```

### Environment Security
- Change default passwords
- Use strong SECRET_KEY
- Secure API keys
- Enable firewall rules
- Regular backups

## 📝 Notes

- Volumes persist data between container restarts
- Production uses optimized builds and nginx
- Dependencies ensure services start in correct order
- Network isolation between services for security 