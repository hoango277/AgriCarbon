from pydantic import BaseModel, validator, EmailStr
from typing import Optional
from datetime import datetime


class PromotionRegisterCreate(BaseModel):
    # Company Information
    company_name: str
    business_license: str  # Changed from tax_code
    address: str           # Changed from headquarters
    phone: Optional[str] = ""
    email: Optional[str] = ""
    
    # Representative Information
    representative_name: str
    representative_position: Optional[str] = "Đại diện"
    representative_phone: Optional[str] = ""
    representative_email: Optional[str] = ""
    
    # Project Information
    project_name: str
    project_location: str  # Changed from coordinates
    project_area: float    # Changed from implementation_area
    project_description: str
    
    # Terms and Signature
    terms_accepted: bool   # Changed from agreed_to_terms
    signature_data: Optional[str] = None  # Base64 encoded signature
    
    @validator('project_area')
    def validate_project_area(cls, v):
        if v <= 0:
            raise ValueError('Project area must be greater than 0')
        return v
    
    @validator('terms_accepted')
    def validate_terms_accepted(cls, v):
        if not v:
            raise ValueError('Must agree to terms and conditions')
        return v


class PromotionRegisterResponse(BaseModel):
    id: int
    company_name: str
    business_license: str
    address: str
    phone: Optional[str] = ""
    email: Optional[str] = ""
    representative_name: str
    representative_position: Optional[str] = ""
    representative_phone: Optional[str] = ""
    representative_email: Optional[str] = ""
    project_name: str
    project_location: str
    project_area: float
    project_description: str
    terms_accepted: bool
    signature_data: Optional[str] = None
    status: str
    payment_status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    admin_notes: Optional[str] = None
    
    class Config:
        from_attributes = True


class PromotionRegisterUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    admin_notes: Optional[str] = None
    
    @validator('status')
    def validate_status(cls, v):
        if v and v not in ['pending', 'approved', 'rejected']:
            raise ValueError('Status must be pending, approved, or rejected')
        return v
    
    @validator('payment_status')
    def validate_payment_status(cls, v):
        if v and v not in ['unpaid', 'paid', 'refunded']:
            raise ValueError('Payment status must be unpaid, paid, or refunded')
        return v


class PromotionRegisterList(BaseModel):
    registrations: list[PromotionRegisterResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PromotionStats(BaseModel):
    total_registrations: int
    pending_registrations: int
    approved_registrations: int
    rejected_registrations: int
    paid_registrations: int
    unpaid_registrations: int
    total_implementation_area: float
    package_6_count: int
    package_12_count: int
    package_24_count: int
