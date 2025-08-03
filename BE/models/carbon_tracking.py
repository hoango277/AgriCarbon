from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from configs.database import Base


class CarbonTracking(Base):
    __tablename__ = "carbon_tracking"
    
    id = Column(Integer, primary_key=True, index=True)
    crop_declaration_id = Column(Integer, ForeignKey("crop_declarations.id"), nullable=False)
    week_start_date = Column(Date, nullable=False)
    week_end_date = Column(Date, nullable=False)
    carbon_credits = Column(Float, nullable=False, comment="Tín chỉ carbon tính bằng tấn CO2")
    measured_at = Column(DateTime, nullable=False, comment="Thời gian thực hiện đo lường")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    crop_declaration = relationship("CropDeclaration", back_populates="carbon_tracking")