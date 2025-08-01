from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from models.user import UserRole

class CCCDInfo(BaseModel):
    # Mặt trước
    full_name: str
    birth_date: date
    gender: str
    cccd: str
    current_address: str
    hometown: str
    
    # Mặt sau
    issue_date: date
    issue_place: str

class UserRegister(BaseModel):
    full_name: str
    birth_date: date
    gender: str
    cccd: str
    current_address: str
    hometown: str
    issue_date: date
    issue_place: str
    phone_number: str
    role: Optional[UserRole] = UserRole.FARMER

class UserCreate(BaseModel):
    full_name: str
    birth_date: date
    gender: str
    cccd: str
    current_address: str
    hometown: str
    issue_date: date
    issue_place: str
    phone_number: str
    password_hash: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    birth_date: date
    gender: str
    cccd: str
    current_address: str
    hometown: str
    issue_date: date
    issue_place: str
    phone_number: str
    role: UserRole
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    cccd: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    cccd: Optional[str] = None

class ChangePassword(BaseModel):
    current_password: str
    new_password: str 