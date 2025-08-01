from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Annotated

from configs.database import get_db
from configs.auth import get_password_hash, verify_password, create_access_token, get_current_user
from configs.settings import settings
from models.user import User
from schemas.user import UserRegister, UserResponse, Token, UserLogin, CCCDInfo, ChangePassword
from services.gemini_service import gemini_service

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    # Check if phone number already exists
    existing_user = db.query(User).filter(User.phone_number == user_data.phone_number).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số điện thoại đã được đăng ký"
        )
    
    # Check if CCCD already exists
    existing_cccd = db.query(User).filter(User.cccd == user_data.cccd).first()
    if existing_cccd:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số CCCD đã được đăng ký"
        )
    
    # Create default password: phone_number@123
    default_password = f"{user_data.phone_number}@123"
    password_hash = get_password_hash(default_password)
    
    # Create new user
    db_user = User(
        full_name=user_data.full_name,
        birth_date=user_data.birth_date,
        gender=user_data.gender,
        cccd=user_data.cccd,
        current_address=user_data.current_address,
        hometown=user_data.hometown,
        issue_date=user_data.issue_date,
        issue_place=user_data.issue_place,
        phone_number=user_data.phone_number,
        password_hash=password_hash,
        role=user_data.role
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    # OAuth2PasswordRequestForm uses username field, we'll use it for CCCD
    user = db.query(User).filter(User.cccd == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="CCCD hoặc mật khẩu không đúng",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.cccd}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/extract-cccd", response_model=CCCDInfo)
async def extract_cccd_info(
    front_image: Annotated[UploadFile, File(description="Ảnh mặt trước CCCD")],
    back_image: Annotated[UploadFile, File(description="Ảnh mặt sau CCCD")]
):
    # Read image files
    front_image_bytes = await front_image.read()
    back_image_bytes = await back_image.read()
    
    # Extract CCCD info using Gemini
    cccd_info = await gemini_service.extract_cccd_info(front_image_bytes, back_image_bytes)
    
    return cccd_info


@router.post("/change-password")
async def change_password(
    password_data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu hiện tại không đúng"
        )
    
    # Update password
    new_password_hash = get_password_hash(password_data.new_password)
    current_user.password_hash = new_password_hash
    
    db.commit()
    
    return {"message": "Đổi mật khẩu thành công"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user 