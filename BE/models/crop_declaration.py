from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from configs.database import Base
import enum

class DeclarationStatus(enum.Enum):
    DRAFT = "draft"  # Đang khai báo
    COMMITTED = "committed"  # Đã ký cam kết
    PENDING = "pending"  # Chờ xác nhận
    APPROVED = "approved"  # Đã xác nhận
    REJECTED = "rejected"  # Từ chối

class CropDeclaration(Base):
    __tablename__ = "crop_declarations"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Liên kết với user (nông dân)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Thông tin khu vực
    area_name = Column(String(255), nullable=False)  # Tên khu vực
    latitude = Column(Float, nullable=False)  # GPS latitude
    longitude = Column(Float, nullable=False)  # GPS longitude
    area_size = Column(Float, nullable=False)  # Diện tích (hecta)
    
    # Thông tin cây trồng
    crop_type = Column(String(255), nullable=False)  # Loại cây trồng
    planting_years = Column(Integer, nullable=False)  # Số năm trồng
    
    # Minh chứng
    evidence_image_path = Column(String(500), nullable=True)  # Đường dẫn ảnh minh chứng
    
    # Trạng thái và thời gian
    status = Column(Enum(DeclarationStatus), nullable=False, default=DeclarationStatus.DRAFT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Thời gian admin xác nhận
    approved_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="crop_declarations")
    approved_by_user = relationship("User", foreign_keys=[approved_by])
    commitment = relationship("Commitment", back_populates="crop_declaration", uselist=False)
    carbon_tracking = relationship("CarbonTracking", back_populates="crop_declaration")