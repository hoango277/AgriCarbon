from sqlalchemy import Column, Integer, String, Date, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from configs.database import Base
import enum

class UserRole(enum.Enum):
    FARMER = "farmer"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Thông tin từ CCCD mặt trước
    full_name = Column(String(255), nullable=False)
    birth_date = Column(Date, nullable=False)
    gender = Column(String(10), nullable=False)
    cccd = Column(String(20), unique=True, index=True, nullable=False)
    current_address = Column(String(500), nullable=False)
    hometown = Column(String(500), nullable=False)  # Quê quán
    
    # Thông tin từ CCCD mặt sau
    issue_date = Column(Date, nullable=False)
    issue_place = Column(String(255), nullable=False)
    
    # Thông tin bổ sung
    phone_number = Column(String(15), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.FARMER)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    crop_declarations = relationship("CropDeclaration", foreign_keys="CropDeclaration.user_id", back_populates="user") 