from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, LargeBinary
from sqlalchemy.sql import func
from configs.database import Base


class PromotionRegister(Base):
    __tablename__ = "promotion_registrations"

    id = Column(Integer, primary_key=True, index=True)
    
    # Company Information
    company_name = Column(String(255), nullable=False)
    business_license = Column(String(50), nullable=False)  # Changed from tax_code
    address = Column(Text, nullable=False)  # Changed from headquarters
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    
    # Representative Information  
    representative_name = Column(String(255), nullable=False)
    representative_position = Column(String(100), nullable=True)
    representative_phone = Column(String(20), nullable=True)
    representative_email = Column(String(100), nullable=True)
    
    # Project Information
    project_name = Column(String(255), nullable=False)
    project_location = Column(String(255), nullable=False)  # Changed from coordinates
    project_area = Column(Float, nullable=False)  # Changed from implementation_area
    project_description = Column(Text, nullable=True)
    
    # Terms and Signature
    terms_accepted = Column(Boolean, default=False, nullable=False)  # Changed from agreed_to_terms
    signature_data = Column(Text, nullable=True)  # Store signature as text (base64)
    
    # Status and Metadata
    status = Column(String(20), default="pending", nullable=False)  # pending, approved, rejected
    payment_status = Column(String(20), default="unpaid", nullable=False)  # unpaid, paid, refunded
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Optional: Admin notes
    admin_notes = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<PromotionRegister(company_name='{self.company_name}', business_license='{self.business_license}', status='{self.status}')>"
