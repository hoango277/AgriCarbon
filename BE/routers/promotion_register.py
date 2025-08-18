from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Optional
import base64
import logging

from configs.database import get_db
from models.promotion_register import PromotionRegister
from schemas.promotion_register import (
    PromotionRegisterCreate, 
    PromotionRegisterResponse, 
    PromotionRegisterUpdate,
    PromotionRegisterList,
    PromotionStats
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/promotion-register", response_model=PromotionRegisterResponse)
async def create_promotion_registration(
    registration_data: PromotionRegisterCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new promotion registration
    """
    try:
        # Check if business license already exists
        # existing_registration = db.query(PromotionRegister).filter(
        #     PromotionRegister.business_license == registration_data.business_license
        # ).first()
        
        # if existing_registration:
        #     raise HTTPException(
        #         status_code=status.HTTP_409_CONFLICT,
        #         detail="A registration with this business license already exists"
        #     )
        
        # Keep signature as text (base64) for easier handling
        signature_text = None
        if registration_data.signature_data:
            signature_text = registration_data.signature_data
        
        # Create new registration
        new_registration = PromotionRegister(
            company_name=registration_data.company_name,
            business_license=registration_data.business_license,
            address=registration_data.address,
            phone=registration_data.phone,
            email=registration_data.email,
            representative_name=registration_data.representative_name,
            representative_position=registration_data.representative_position,
            representative_phone=registration_data.representative_phone,
            representative_email=registration_data.representative_email,
            project_name=registration_data.project_name,
            project_location=registration_data.project_location,
            project_area=registration_data.project_area,
            project_description=registration_data.project_description,
            terms_accepted=registration_data.terms_accepted,
            signature_data=signature_text,
            status="pending",
            payment_status="unpaid"
        )
        
        db.add(new_registration)
        db.commit()
        db.refresh(new_registration)
        
        logger.info(f"New promotion registration created: {new_registration.id}")
        return new_registration
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating promotion registration: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/promotion-register", response_model=PromotionRegisterList)
async def get_promotion_registrations(
    page: int = 1,
    page_size: int = 10,
    status_filter: Optional[str] = None,
    payment_status_filter: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get list of promotion registrations with filters and pagination
    """
    try:
        query = db.query(PromotionRegister)
        
        # Apply filters
        if status_filter:
            query = query.filter(PromotionRegister.status == status_filter)
        
        if payment_status_filter:
            query = query.filter(PromotionRegister.payment_status == payment_status_filter)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                and_(
                    PromotionRegister.company_name.ilike(search_term) |
                    PromotionRegister.tax_code.ilike(search_term) |
                    PromotionRegister.representative_name.ilike(search_term)
                )
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * page_size
        registrations = query.order_by(PromotionRegister.created_at.desc()).offset(offset).limit(page_size).all()
        
        total_pages = (total + page_size - 1) // page_size
        
        return PromotionRegisterList(
            registrations=registrations,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
        
    except Exception as e:
        logger.error(f"Error fetching promotion registrations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/promotion-register/{registration_id}", response_model=PromotionRegisterResponse)
async def get_promotion_registration(
    registration_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific promotion registration by ID
    """
    registration = db.query(PromotionRegister).filter(
        PromotionRegister.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    return registration


@router.put("/promotion-register/{registration_id}", response_model=PromotionRegisterResponse)
async def update_promotion_registration(
    registration_id: int,
    update_data: PromotionRegisterUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a promotion registration (admin only)
    """
    registration = db.query(PromotionRegister).filter(
        PromotionRegister.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    try:
        # Update fields
        if update_data.status is not None:
            registration.status = update_data.status
        
        if update_data.payment_status is not None:
            registration.payment_status = update_data.payment_status
        
        if update_data.admin_notes is not None:
            registration.admin_notes = update_data.admin_notes
        
        db.commit()
        db.refresh(registration)
        
        logger.info(f"Promotion registration {registration_id} updated")
        return registration
        
    except Exception as e:
        logger.error(f"Error updating promotion registration: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.delete("/promotion-register/{registration_id}")
async def delete_promotion_registration(
    registration_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a promotion registration (admin only)
    """
    registration = db.query(PromotionRegister).filter(
        PromotionRegister.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    try:
        db.delete(registration)
        db.commit()
        
        logger.info(f"Promotion registration {registration_id} deleted")
        return {"message": "Registration deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting promotion registration: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/promotion-register/signature/{registration_id}")
async def get_signature(
    registration_id: int,
    db: Session = Depends(get_db)
):
    """
    Get signature image for a registration
    """
    registration = db.query(PromotionRegister).filter(
        PromotionRegister.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    if not registration.signature_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signature not found"
        )
    
    # Convert binary back to base64
    signature_base64 = base64.b64encode(registration.signature_data).decode('utf-8')
    
    return {
        "signature": f"data:image/png;base64,{signature_base64}"
    }


@router.get("/promotion-register-stats", response_model=PromotionStats)
async def get_promotion_stats(db: Session = Depends(get_db)):
    """
    Get promotion registration statistics
    """
    try:
        total_registrations = db.query(PromotionRegister).count()
        pending_registrations = db.query(PromotionRegister).filter(PromotionRegister.status == "pending").count()
        approved_registrations = db.query(PromotionRegister).filter(PromotionRegister.status == "approved").count()
        rejected_registrations = db.query(PromotionRegister).filter(PromotionRegister.status == "rejected").count()
        
        paid_registrations = db.query(PromotionRegister).filter(PromotionRegister.payment_status == "paid").count()
        unpaid_registrations = db.query(PromotionRegister).filter(PromotionRegister.payment_status == "unpaid").count()
        
        # Calculate total implementation area
        total_area_result = db.query(func.sum(PromotionRegister.implementation_area)).scalar()
        total_implementation_area = total_area_result if total_area_result else 0.0
        
        # Count by package type
        package_6_count = db.query(PromotionRegister).filter(PromotionRegister.monitoring_package == "6").count()
        package_12_count = db.query(PromotionRegister).filter(PromotionRegister.monitoring_package == "12").count()
        package_24_count = db.query(PromotionRegister).filter(PromotionRegister.monitoring_package == "24").count()
        
        return PromotionStats(
            total_registrations=total_registrations,
            pending_registrations=pending_registrations,
            approved_registrations=approved_registrations,
            rejected_registrations=rejected_registrations,
            paid_registrations=paid_registrations,
            unpaid_registrations=unpaid_registrations,
            total_implementation_area=total_implementation_area,
            package_6_count=package_6_count,
            package_12_count=package_12_count,
            package_24_count=package_24_count
        )
        
    except Exception as e:
        logger.error(f"Error fetching promotion stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
