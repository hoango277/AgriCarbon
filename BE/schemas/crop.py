from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from models.crop_declaration import DeclarationStatus
from schemas.user import UserResponse

class CropDeclarationBase(BaseModel):
    area_name: str
    latitude: float
    longitude: float
    area_size: float
    crop_type: str
    planting_years: int

class CropDeclarationCreate(CropDeclarationBase):
    evidence_image_path: Optional[str] = None

class CropDeclarationUpdate(BaseModel):
    area_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_size: Optional[float] = None
    crop_type: Optional[str] = None
    planting_years: Optional[int] = None
    evidence_image_path: Optional[str] = None

class CropDeclarationResponse(CropDeclarationBase):
    id: int
    user_id: int
    status: DeclarationStatus
    evidence_image_path: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    approved_at: Optional[datetime]
    approved_by: Optional[int]
    
    class Config:
        from_attributes = True

class CommitmentBase(BaseModel):
    commitment_text: str
    signature_data: str
    signer_name: str

class CommitmentCreate(CommitmentBase):
    crop_declaration_id: int

class CommitmentResponse(CommitmentBase):
    id: int
    crop_declaration_id: int
    signed_at: datetime
    pdf_path: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class CropDeclarationWithCommitment(CropDeclarationResponse):
    commitment: Optional[CommitmentResponse] = None

class CropDeclarationAdmin(CropDeclarationResponse):
    user: Optional[UserResponse] = None
    commitment: Optional[CommitmentResponse] = None

class LocationRequest(BaseModel):
    latitude: float
    longitude: float

class ApprovalRequest(BaseModel):
    status: DeclarationStatus  # APPROVED hoặc REJECTED
    reason: Optional[str] = None