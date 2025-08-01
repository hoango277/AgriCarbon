# Database Auto-Update System

Hệ thống tự động cập nhật database schema khi có thay đổi trong SQLAlchemy models.

## 🔧 Configuration

### Environment Variables

```env
# Bật/tắt tự động update database
DB_AUTO_UPDATE=true

# Môi trường (development/production)
ENVIRONMENT=development
```

## 🚀 Cách hoạt động

### Development Mode (`ENVIRONMENT=development`)
- **Auto-detect changes**: Tự động phát hiện thay đổi schema
- **Drop & Recreate**: Drop tất cả tables và tạo lại với schema mới
- **⚠️ WARNING**: Tất cả data sẽ bị mất khi recreate tables

### Production Mode (`ENVIRONMENT=production`)
- **Safe mode**: Chỉ tạo tables mới, không modify tables hiện tại
- **No data loss**: Không drop tables đã tồn tại
- **Manual migration**: Cần migration tool cho schema changes

## 📋 Features

### 1. Schema Detection
- Phát hiện tables mới cần tạo
- So sánh columns giữa database và models
- Detect thay đổi trong table structure

### 2. Automatic Updates
```python
# Trong main.py
from configs.database_utils import init_database

# Tự động check và update schema
init_database()
```

### 3. Logging
- Chi tiết log về quá trình update
- Warning khi drop tables
- Error handling với fallback

## 🛠️ Usage Examples

### 1. Thêm Model Mới
```python
# models/new_model.py
class NewModel(Base):
    __tablename__ = "new_table"
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
```

**Kết quả**: Table mới sẽ được tạo tự động khi restart app.

### 2. Thay Đổi Existing Model
```python
# models/user.py
class User(Base):
    # Thêm column mới
    new_field = Column(String(100), nullable=True)
```

**Development**: Table sẽ được drop và recreate với column mới.  
**Production**: Cần manual migration.

### 3. Disable Auto-Update
```env
DB_AUTO_UPDATE=false
```

Chỉ tạo tables mới, không detect changes.

## 🔍 Monitoring

### Log Messages
```
INFO - Checking database schema...
INFO - New tables to create: {'new_table'}
INFO - Table users needs schema update
WARNING - This will DROP and RECREATE all tables. All data will be lost!
INFO - Database schema updated successfully
```

### Manual Check
```python
from configs.database_utils import needs_schema_update

if needs_schema_update():
    print("Schema changes detected!")
```

## ⚠️ Important Notes

### Development
- **Data Loss**: Tables sẽ bị drop và recreate
- **Fast Development**: Không cần manual migration
- **Auto-sync**: Schema luôn sync với models

### Production
- **Data Safety**: Không drop existing tables
- **Manual Migration**: Cần tools như Alembic cho schema changes
- **Conservative**: Chỉ tạo tables mới

### Best Practices
1. **Development**: Dùng `DB_AUTO_UPDATE=true` để dev nhanh
2. **Production**: Dùng `DB_AUTO_UPDATE=false` và migration tools
3. **Testing**: Test thoroughly trước khi deploy
4. **Backup**: Luôn backup data trước khi update schema

## 🐛 Troubleshooting

### Common Issues

**1. Connection Error**
```
Error updating database schema: (pymysql.err.OperationalError)
```
- Check database connection
- Verify DATABASE_URL
- Ensure database server is running

**2. Permission Error**
```
Error dropping tables: (pymysql.err.OperationalError) (1142, "DROP command denied")
```
- Check database user permissions
- Ensure user has DROP/CREATE privileges

**3. Model Import Error**
```
No module named 'models.new_model'
```
- Import models trong main.py
- Check model registration với Base

### Recovery
Nếu có lỗi, system sẽ fallback về `create_all_tables()` để đảm bảo app vẫn chạy được.

## 📊 Performance

- **Startup Time**: +1-2 seconds để check schema
- **Memory**: Minimal overhead
- **Database Load**: Query metadata tables để compare

## 🔧 Customization

Có thể extend `database_utils.py` để:
- Custom schema comparison logic
- Add migration strategies
- Implement rollback functionality
- Add data preservation logic