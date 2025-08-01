import logging
from sqlalchemy import inspect, text
from sqlalchemy.exc import SQLAlchemyError
from configs.database import engine, Base
from configs.settings import settings

logger = logging.getLogger(__name__)

def get_current_tables():
    """Lấy danh sách tables hiện tại trong database"""
    try:
        inspector = inspect(engine)
        return set(inspector.get_table_names())
    except Exception as e:
        logger.error(f"Error getting current tables: {e}")
        return set()

def get_model_tables():
    """Lấy danh sách tables từ SQLAlchemy models"""
    return set(Base.metadata.tables.keys())

def get_table_columns(table_name):
    """Lấy danh sách columns của một table"""
    try:
        inspector = inspect(engine)
        columns = inspector.get_columns(table_name)
        return {col['name']: col for col in columns}
    except Exception as e:
        logger.error(f"Error getting columns for table {table_name}: {e}")
        return {}

def compare_table_schema(table_name):
    """So sánh schema của table hiện tại với model định nghĩa"""
    if table_name not in Base.metadata.tables:
        return False
    
    try:
        # Get current columns from database
        current_cols = get_table_columns(table_name)
        
        # Get expected columns from model
        model_table = Base.metadata.tables[table_name]
        expected_cols = {col.name: col for col in model_table.columns}
        
        # Compare column names
        current_col_names = set(current_cols.keys())
        expected_col_names = set(expected_cols.keys())
        
        if current_col_names != expected_col_names:
            logger.info(f"Table {table_name} has different columns:")
            logger.info(f"  Current: {current_col_names}")
            logger.info(f"  Expected: {expected_col_names}")
            return False
        
        # Could add more detailed column type checking here if needed
        return True
        
    except Exception as e:
        logger.error(f"Error comparing schema for table {table_name}: {e}")
        return False

def needs_schema_update():
    """Kiểm tra xem database có cần update schema không"""
    try:
        current_tables = get_current_tables()
        model_tables = get_model_tables()
        
        # Check for new tables
        if model_tables - current_tables:
            logger.info(f"New tables to create: {model_tables - current_tables}")
            return True
        
        # Check for removed tables (optional - might want to keep old tables)
        if current_tables - model_tables:
            logger.info(f"Tables to potentially remove: {current_tables - model_tables}")
        
        # Check for schema changes in existing tables
        for table_name in model_tables & current_tables:
            if not compare_table_schema(table_name):
                logger.info(f"Table {table_name} needs schema update")
                return True
        
        return False
        
    except Exception as e:
        logger.error(f"Error checking schema update needs: {e}")
        return False

def drop_all_tables():
    """Drop tất cả tables (chỉ dùng trong development)"""
    try:
        logger.warning("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        logger.info("All tables dropped successfully")
    except Exception as e:
        logger.error(f"Error dropping tables: {e}")
        raise

def create_all_tables():
    """Tạo tất cả tables từ models"""
    try:
        logger.info("Creating all tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("All tables created successfully")
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        raise

def update_database_schema():
    """Main function để update database schema"""
    try:
        logger.info("Checking database schema...")
        
        if not settings.DB_AUTO_UPDATE:
            logger.info("Database auto-update is disabled")
            create_all_tables()  # Chỉ tạo tables mới
            return
        
        if settings.ENVIRONMENT == "production":
            logger.warning("Auto-update disabled in production. Only creating new tables.")
            create_all_tables()  # Chỉ tạo tables mới trong production
            return
        
        # Development mode - có thể drop và recreate
        if needs_schema_update():
            logger.info("Schema changes detected. Updating database...")
            
            # Backup note: Trong production, bạn sẽ cần migration tool
            logger.warning("This will DROP and RECREATE all tables. All data will be lost!")
            
            drop_all_tables()
            create_all_tables()
            
            logger.info("Database schema updated successfully")
        else:
            logger.info("Database schema is up to date")
            
    except Exception as e:
        logger.error(f"Error updating database schema: {e}")
        # Fallback - try to create tables anyway
        try:
            create_all_tables()
        except Exception as create_error:
            logger.error(f"Fallback table creation also failed: {create_error}")
            raise

def init_database():
    """Initialize database - gọi function này trong main.py"""
    logger.info("Initializing database...")
    update_database_schema()
    logger.info("Database initialization complete")