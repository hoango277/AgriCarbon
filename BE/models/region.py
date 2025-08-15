from sqlalchemy import Column, String, Integer, Float, DateTime, Text, CHAR
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

from configs.database import Base

class Region(Base):
    __tablename__ = "regions"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    region_id = Column(Integer, unique=True, nullable=False, comment="ID vùng gốc")
    region_name = Column(String(255), nullable=False, comment="Tên vùng")
    
    # Thông tin địa lý
    area_ha = Column(Float, default=0.0, comment="Diện tích (ha)")
    longitude = Column(Float, nullable=False, comment="Kinh độ")
    latitude = Column(Float, nullable=False, comment="Vĩ độ")
    
    # Thông tin sinh học
    chm_m = Column(Float, nullable=True, comment="CHM (m) - Canopy Height Model")
    vegetation_coverage = Column(Float, nullable=True, comment="Độ phủ thực vật (%)")
    
    # Thông tin hình học
    polygon_points = Column(Integer, default=0, comment="Số điểm POLYGON")
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, comment="Ngày tạo")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="Ngày cập nhật")
    
    def to_dict(self):
        """Convert region to dictionary"""
        return {
            "id": self.id,
            "region_id": self.region_id,
            "region_name": self.region_name,
            "area_ha": self.area_ha,
            "longitude": self.longitude,
            "latitude": self.latitude,
            "chm_m": self.chm_m,
            "vegetation_coverage": self.vegetation_coverage,
            "polygon_points": self.polygon_points,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
