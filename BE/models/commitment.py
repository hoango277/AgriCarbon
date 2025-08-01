from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from configs.database import Base

class Commitment(Base):
    __tablename__ = "commitments"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Liên kết với crop declaration
    crop_declaration_id = Column(Integer, ForeignKey("crop_declarations.id"), nullable=False, unique=True)
    
    # Thông tin cam kết
    commitment_text = Column(Text, nullable=False)  # Nội dung cam kết
    signature_data = Column(Text, nullable=False)  # Dữ liệu chữ ký (base64 canvas)
    
    # Thông tin người ký
    signer_name = Column(String(255), nullable=False)  # Tên người ký
    signed_at = Column(DateTime(timezone=True), server_default=func.now())  # Thời gian ký
    
    # PDF file path (nếu đã tạo PDF)
    pdf_path = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    crop_declaration = relationship("CropDeclaration", back_populates="commitment")