from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func, desc
from datetime import date, datetime, timedelta
from typing import List

from configs.database import get_db
from configs.auth import get_current_user
from models import User, CropDeclaration, CarbonTracking
from schemas import (
    CarbonTrackingCreate, CarbonTrackingUpdate, CarbonTrackingResponse,
    CarbonSummary, WeeklyCarbonData, CropDeclarationResponse
)
from schemas.user import UserResponse

router = APIRouter(prefix="/carbon", tags=["carbon-tracking"])


@router.get("/areas", response_model=List[CropDeclarationResponse])
async def get_farmer_areas(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách các vùng đất (khai báo đã được duyệt) của farmer"""
    if current_user.role.value != 'farmer':
        raise HTTPException(status_code=403, detail="Chỉ farmer mới có thể xem các vùng đất")
    
    areas = db.query(CropDeclaration).filter(
        and_(
            CropDeclaration.user_id == current_user.id,
            CropDeclaration.status == 'approved'
        )
    ).all()
    
    return areas


@router.get("/areas/{area_id}/summary", response_model=CarbonSummary)
async def get_area_carbon_summary(
    area_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy tổng hợp dữ liệu carbon của một vùng đất"""
    
    # Kiểm tra quyền access vùng đất
    area = db.query(CropDeclaration).filter(CropDeclaration.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Không tìm thấy vùng đất")
    
    if current_user.role.value == 'farmer' and area.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem vùng đất này")
    
    # Lấy tất cả dữ liệu carbon tracking của vùng đất
    carbon_data = db.query(CarbonTracking).filter(
        CarbonTracking.crop_declaration_id == area_id
    ).order_by(CarbonTracking.week_start_date).all()
    
    if not carbon_data:
        return CarbonSummary(
            crop_declaration_id=area_id,
            area_name=area.area_name,
            total_carbon_credits=0.0,
            average_weekly_credits=0.0,
            total_weeks=0,
            latest_measurement=None,
            weekly_data=[]
        )
    
    # Tính toán thống kê
    total_credits = sum(data.carbon_credits for data in carbon_data)
    total_weeks = len(carbon_data)
    average_credits = total_credits / total_weeks if total_weeks > 0 else 0.0
    latest_measurement = max(data.measured_at for data in carbon_data)
    
    # Chuẩn bị dữ liệu cho chart
    weekly_data = []
    for i, data in enumerate(carbon_data):
        week_label = f"Tuần {i + 1}"
        if data.week_start_date.year != datetime.now().year:
            week_label += f" - {data.week_start_date.year}"
            
        weekly_data.append(WeeklyCarbonData(
            week_start=data.week_start_date.strftime("%Y-%m-%d"),
            week_end=data.week_end_date.strftime("%Y-%m-%d"),
            carbon_credits=data.carbon_credits,
            week_label=week_label
        ))
    
    return CarbonSummary(
        crop_declaration_id=area_id,
        area_name=area.area_name,
        total_carbon_credits=total_credits,
        average_weekly_credits=average_credits,
        total_weeks=total_weeks,
        latest_measurement=latest_measurement,
        weekly_data=weekly_data
    )


@router.post("/tracking", response_model=CarbonTrackingResponse)
async def create_carbon_tracking(
    carbon_data: CarbonTrackingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo dữ liệu tracking carbon mới (cho AI hoặc admin)"""
    
    # Kiểm tra quyền
    if current_user.role.value not in ['admin']:
        # Nếu là farmer, chỉ được tạo cho vùng đất của mình
        if current_user.role.value == 'farmer':
            area = db.query(CropDeclaration).filter(
                CropDeclaration.id == carbon_data.crop_declaration_id
            ).first()
            if not area or area.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="Không có quyền tạo dữ liệu cho vùng đất này")
        else:
            raise HTTPException(status_code=403, detail="Chỉ admin hoặc farmer chủ sở hữu mới có thể tạo dữ liệu")
    
    # Kiểm tra vùng đất có tồn tại và được duyệt
    area = db.query(CropDeclaration).filter(
        and_(
            CropDeclaration.id == carbon_data.crop_declaration_id,
            CropDeclaration.status == 'approved'
        )
    ).first()
    if not area:
        raise HTTPException(status_code=404, detail="Vùng đất không tồn tại hoặc chưa được duyệt")
    
    # Kiểm tra trùng lặp tuần
    existing = db.query(CarbonTracking).filter(
        and_(
            CarbonTracking.crop_declaration_id == carbon_data.crop_declaration_id,
            CarbonTracking.week_start_date == carbon_data.week_start_date
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Dữ liệu cho tuần này đã tồn tại")
    
    # Tạo record mới
    db_carbon = CarbonTracking(**carbon_data.dict())
    db.add(db_carbon)
    db.commit()
    db.refresh(db_carbon)
    
    return db_carbon


@router.put("/tracking/{tracking_id}", response_model=CarbonTrackingResponse)
async def update_carbon_tracking(
    tracking_id: int,
    carbon_data: CarbonTrackingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cập nhật dữ liệu carbon tracking"""
    
    # Lấy record cần update
    db_carbon = db.query(CarbonTracking).options(
        joinedload(CarbonTracking.crop_declaration)
    ).filter(CarbonTracking.id == tracking_id).first()
    
    if not db_carbon:
        raise HTTPException(status_code=404, detail="Không tìm thấy dữ liệu carbon")
    
    # Kiểm tra quyền
    if current_user.role.value == 'farmer':
        if db_carbon.crop_declaration.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Không có quyền cập nhật dữ liệu này")
    elif current_user.role.value != 'admin':
        raise HTTPException(status_code=403, detail="Không có quyền cập nhật")
    
    # Cập nhật các field được cung cấp
    update_data = carbon_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_carbon, field, value)
    
    db.commit()
    db.refresh(db_carbon)
    
    return db_carbon


@router.delete("/tracking/{tracking_id}")
async def delete_carbon_tracking(
    tracking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Xóa dữ liệu carbon tracking"""
    
    # Lấy record cần xóa
    db_carbon = db.query(CarbonTracking).options(
        joinedload(CarbonTracking.crop_declaration)
    ).filter(CarbonTracking.id == tracking_id).first()
    
    if not db_carbon:
        raise HTTPException(status_code=404, detail="Không tìm thấy dữ liệu carbon")
    
    # Kiểm tra quyền
    if current_user.role.value == 'farmer':
        if db_carbon.crop_declaration.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Không có quyền xóa dữ liệu này")
    elif current_user.role.value != 'admin':
        raise HTTPException(status_code=403, detail="Không có quyền xóa")
    
    db.delete(db_carbon)
    db.commit()
    
    return {"message": "Đã xóa dữ liệu carbon thành công"}


@router.get("/tracking", response_model=List[CarbonTrackingResponse])
async def get_all_carbon_tracking(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy tất cả dữ liệu carbon tracking (admin only)"""
    
    if current_user.role.value != 'admin':
        raise HTTPException(status_code=403, detail="Chỉ admin mới có thể xem tất cả dữ liệu")
    
    carbon_data = db.query(CarbonTracking).options(
        joinedload(CarbonTracking.crop_declaration)
    ).order_by(desc(CarbonTracking.created_at)).all()
    
    return carbon_data


# ==================== ADMIN ENDPOINTS ====================

@router.get("/admin/farmers", response_model=List[UserResponse])
async def get_all_farmers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách tất cả nông dân (admin only)"""
    
    if current_user.role.value != 'admin':
        raise HTTPException(status_code=403, detail="Chỉ admin mới có thể xem danh sách nông dân")
    
    farmers = db.query(User).filter(User.role == 'farmer').order_by(User.created_at.desc()).all()
    
    return farmers


@router.get("/admin/farmers/{farmer_id}/areas", response_model=List[CropDeclarationResponse])
async def get_farmer_areas_by_admin(
    farmer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách vùng đất đã được duyệt của một farmer cụ thể (admin only)"""
    
    if current_user.role.value != 'admin':
        raise HTTPException(status_code=403, detail="Chỉ admin mới có thể xem vùng đất của farmer")
    
    # Kiểm tra farmer có tồn tại
    farmer = db.query(User).filter(
        and_(User.id == farmer_id, User.role == 'farmer')
    ).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Không tìm thấy nông dân")
    
    # Lấy các vùng đất đã được duyệt
    areas = db.query(CropDeclaration).filter(
        and_(
            CropDeclaration.user_id == farmer_id,
            CropDeclaration.status == 'approved'
        )
    ).order_by(CropDeclaration.created_at.desc()).all()
    
    return areas