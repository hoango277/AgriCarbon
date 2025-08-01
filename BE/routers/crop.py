from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import os
import uuid
from datetime import datetime

from configs.database import get_db
from configs.auth import get_current_user
from models.user import User, UserRole
from models.crop_declaration import CropDeclaration, DeclarationStatus
from models.commitment import Commitment
from schemas.crop import (
    CropDeclarationCreate, CropDeclarationResponse, CropDeclarationUpdate,
    CropDeclarationWithCommitment, CropDeclarationAdmin, CommitmentCreate, CommitmentResponse,
    ApprovalRequest, LocationRequest
)

router = APIRouter()

# Helper function to check if user is farmer
def check_farmer_role(current_user: User):
    if current_user.role != UserRole.FARMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ nông dân mới có thể thực hiện thao tác này"
        )

# Helper function to check if user is admin
def check_admin_role(current_user: User):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ admin mới có thể thực hiện thao tác này"
        )

@router.post("/declarations", response_model=CropDeclarationResponse)
async def create_crop_declaration(
    declaration_data: CropDeclarationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo khai báo cây trồng mới"""
    check_farmer_role(current_user)
    
    db_declaration = CropDeclaration(
        user_id=current_user.id,
        area_name=declaration_data.area_name,
        latitude=declaration_data.latitude,
        longitude=declaration_data.longitude,
        area_size=declaration_data.area_size,
        crop_type=declaration_data.crop_type,
        planting_years=declaration_data.planting_years,
        evidence_image_path=declaration_data.evidence_image_path,
        status=DeclarationStatus.DRAFT
    )
    
    db.add(db_declaration)
    db.commit()
    db.refresh(db_declaration)
    
    return db_declaration

@router.get("/declarations", response_model=List[CropDeclarationWithCommitment])
async def get_crop_declarations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách khai báo cây trồng của nông dân hiện tại"""
    check_farmer_role(current_user)
    
    declarations = db.query(CropDeclaration)\
        .filter(CropDeclaration.user_id == current_user.id)\
        .order_by(CropDeclaration.created_at.desc())\
        .all()
    
    return declarations

@router.get("/declarations/{declaration_id}")
async def get_crop_declaration(
    declaration_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy chi tiết một khai báo cây trồng"""
    declaration = db.query(CropDeclaration).options(
        joinedload(CropDeclaration.user),
        joinedload(CropDeclaration.commitment)
    ).filter(CropDeclaration.id == declaration_id).first()
    
    if not declaration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khai báo"
        )
    
    # Farmer chỉ có thể xem khai báo của mình, Admin có thể xem tất cả
    if current_user.role == UserRole.FARMER and declaration.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền xem khai báo này"
        )
    
    # Return different schema based on user role
    if current_user.role == UserRole.ADMIN:
        return CropDeclarationAdmin.from_orm(declaration)
    else:
        return CropDeclarationWithCommitment.from_orm(declaration)

@router.put("/declarations/{declaration_id}", response_model=CropDeclarationResponse)
async def update_crop_declaration(
    declaration_id: int,
    declaration_data: CropDeclarationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cập nhật khai báo cây trồng (chỉ khi ở trạng thái DRAFT)"""
    check_farmer_role(current_user)
    
    declaration = db.query(CropDeclaration)\
        .filter(CropDeclaration.id == declaration_id, CropDeclaration.user_id == current_user.id)\
        .first()
    
    if not declaration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khai báo"
        )
    
    if declaration.status != DeclarationStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ có thể chỉnh sửa khai báo ở trạng thái nháp"
        )
    
    # Update fields
    for field, value in declaration_data.dict(exclude_unset=True).items():
        setattr(declaration, field, value)
    
    db.commit()
    db.refresh(declaration)
    
    return declaration

@router.delete("/declarations/{declaration_id}")
async def delete_crop_declaration(
    declaration_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Xóa khai báo cây trồng (chỉ chủ sở hữu và khi chưa được duyệt)"""
    check_farmer_role(current_user)
    
    declaration = db.query(CropDeclaration)\
        .filter(CropDeclaration.id == declaration_id, CropDeclaration.user_id == current_user.id)\
        .first()
    
    if not declaration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khai báo"
        )
    
    # Chỉ cho phép xóa khi chưa approved
    if declaration.status == DeclarationStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể xóa khai báo đã được phê duyệt"
        )
    
    # Delete associated commitment if exists
    commitment = db.query(Commitment)\
        .filter(Commitment.crop_declaration_id == declaration_id)\
        .first()
    if commitment:
        db.delete(commitment)
    
    # Delete evidence file if exists
    if declaration.evidence_image_path and os.path.exists(declaration.evidence_image_path):
        try:
            os.remove(declaration.evidence_image_path)
        except Exception as e:
            print(f"Could not delete file {declaration.evidence_image_path}: {e}")
    
    # Delete declaration
    db.delete(declaration)
    db.commit()
    
    return {"message": "Xóa khai báo thành công"}

@router.post("/declarations/{declaration_id}/upload-evidence")
async def upload_evidence_image(
    declaration_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload ảnh minh chứng cho khai báo"""
    check_farmer_role(current_user)
    
    declaration = db.query(CropDeclaration)\
        .filter(CropDeclaration.id == declaration_id, CropDeclaration.user_id == current_user.id)\
        .first()
    
    if not declaration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khai báo"
        )
    
    if declaration.status != DeclarationStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ có thể upload ảnh khi ở trạng thái nháp"
        )
    
    # Create uploads directory if not exists
    upload_dir = "uploads/evidence"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Update declaration
    declaration.evidence_image_path = file_path
    db.commit()
    
    return {"message": "Upload ảnh thành công", "file_path": file_path}

@router.post("/declarations/{declaration_id}/commitment", response_model=CommitmentResponse)
async def create_commitment(
    declaration_id: int,
    commitment_data: CommitmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo cam kết cho khai báo (chuyển sang bước 2)"""
    check_farmer_role(current_user)
    
    declaration = db.query(CropDeclaration)\
        .filter(CropDeclaration.id == declaration_id, CropDeclaration.user_id == current_user.id)\
        .first()
    
    if not declaration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khai báo"
        )
    
    if declaration.status != DeclarationStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ có thể tạo cam kết khi ở trạng thái nháp"
        )
    
    # Check if commitment already exists
    existing_commitment = db.query(Commitment)\
        .filter(Commitment.crop_declaration_id == declaration_id)\
        .first()
    
    if existing_commitment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cam kết đã tồn tại cho khai báo này"
        )
    
    # Create commitment
    db_commitment = Commitment(
        crop_declaration_id=declaration_id,
        commitment_text=commitment_data.commitment_text,
        signature_data=commitment_data.signature_data,
        signer_name=commitment_data.signer_name
    )
    
    # Update declaration status
    declaration.status = DeclarationStatus.COMMITTED
    
    db.add(db_commitment)
    db.commit()
    db.refresh(db_commitment)
    
    return db_commitment

@router.post("/declarations/{declaration_id}/submit")
async def submit_declaration(
    declaration_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Nộp khai báo để chờ xác nhận (chuyển sang bước 3)"""
    check_farmer_role(current_user)
    
    declaration = db.query(CropDeclaration)\
        .filter(CropDeclaration.id == declaration_id, CropDeclaration.user_id == current_user.id)\
        .first()
    
    if not declaration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khai báo"
        )
    
    if declaration.status != DeclarationStatus.COMMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ có thể nộp khai báo khi đã ký cam kết"
        )
    
    # Update status to pending
    declaration.status = DeclarationStatus.PENDING
    db.commit()
    
    return {"message": "Nộp khai báo thành công, đang chờ xác nhận"}

# Admin endpoints
@router.get("/admin/declarations", response_model=List[CropDeclarationAdmin])
async def get_all_declarations_admin(
    status: Optional[DeclarationStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin xem tất cả khai báo"""
    check_admin_role(current_user)
    
    query = db.query(CropDeclaration).options(
        joinedload(CropDeclaration.user),
        joinedload(CropDeclaration.commitment)
    )
    
    if status:
        query = query.filter(CropDeclaration.status == status)
    
    declarations = query.order_by(CropDeclaration.created_at.desc()).all()
    
    return declarations

@router.post("/admin/declarations/{declaration_id}/approve")
async def approve_declaration(
    declaration_id: int,
    approval_data: ApprovalRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin xác nhận hoặc từ chối khai báo"""
    check_admin_role(current_user)
    
    declaration = db.query(CropDeclaration)\
        .filter(CropDeclaration.id == declaration_id)\
        .first()
    
    if not declaration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khai báo"
        )
    
    if declaration.status != DeclarationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ có thể xác nhận khai báo ở trạng thái chờ duyệt"
        )
    
    # Update declaration
    declaration.status = approval_data.status
    declaration.approved_by = current_user.id
    declaration.approved_at = datetime.utcnow()
    
    db.commit()
    
    status_msg = "phê duyệt" if approval_data.status == DeclarationStatus.APPROVED else "từ chối"
    return {"message": f"Đã {status_msg} khai báo thành công"}

@router.get("/files/{file_path:path}")
async def get_evidence_file(file_path: str):
    """Serve ảnh minh chứng"""
    # Security: Only allow files from uploads directory
    if not file_path.startswith("uploads/"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Truy cập file không được phép"
        )
    
    # Check if file exists
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File không tồn tại"
        )
    
    return FileResponse(file_path)