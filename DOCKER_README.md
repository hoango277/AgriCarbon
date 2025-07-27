# AgriCarbon Docker Setup

Hướng dẫn setup và chạy dự án AgriCarbon bằng Docker.

## 📋 Yêu cầu hệ thống

- Docker Engine 20.10+
- Docker Compose 2.0+
- Ít nhất 4GB RAM
- 10GB dung lượng trống

## 🚀 Quick Start

### Production Mode

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

### Development Mode

```bash
# Chạy development environment với hot reload
docker-compose -f docker-compose.dev.yml up -d

# Xem logs của service cụ thể
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend

# Rebuild service cụ thể
docker-compose -f docker-compose.dev.yml up -d --build backend
```

## 🌐 Truy cập ứng dụng

### Production
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:3306

### Development  
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001
- **Database**: localhost:3307

## 📦 Services

### Database (MySQL 8.0)
- **Container**: `agricarbon_db`
- **Port**: 3306 (prod) / 3307 (dev)
- **Database**: overrun
- **User**: root
- **Password**: hoa0976271476

### Backend (FastAPI)
- **Container**: `agricarbon_backend`
- **Port**: 8000 (prod) / 8001 (dev)
- **Health check**: `/`
- **API Docs**: `/docs`

### Frontend (React + Vite + Nginx)
- **Container**: `agricarbon_frontend`
- **Port**: 80 (prod) / 5173 (dev)
- **Health check**: `/health`

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

### Backend Development
```bash
# Start only database
docker-compose -f docker-compose.dev.yml up -d database

# Run backend locally for development
cd BE
pip install -r requirements.txt
python run.py
```

### Frontend Development
```bash
# Start backend services
docker-compose -f docker-compose.dev.yml up -d database backend

# Run frontend locally
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

### Health Checks
```bash
# Check all services health
docker-compose ps

# Manual health check
curl http://localhost:8000/
curl http://localhost/health
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
- Use development compose for local development with hot reload
- Production uses optimized builds and nginx
- Health checks ensure services are ready before dependencies start
- Network isolation between services for security 