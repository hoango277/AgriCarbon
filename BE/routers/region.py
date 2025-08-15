from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from configs.database import get_db
from configs.auth import get_current_user_or_company
from models.region import Region
from schemas.region import RegionCreate, RegionUpdate, RegionResponse, RegionListResponse

router = APIRouter(prefix="/regions", tags=["regions"])

@router.get("/", response_model=RegionListResponse)
async def get_regions(
    page: int = Query(1, ge=1, description="Số trang"),
    limit: int = Query(100, ge=1, le=1000, description="Số lượng per page"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên vùng"),
    current_user = Depends(get_current_user_or_company),
    db: Session = Depends(get_db)
):
    """Lấy danh sách các vùng đất với phân trang"""
    try:
        # Calculate offset
        offset = (page - 1) * limit
        
        # Build query
        query = db.query(Region)
        
        # Apply search filter
        if search:
            query = query.filter(Region.region_name.contains(search))
        
        # Get total count
        total = query.count()
        
        # Get paginated results
        regions = query.offset(offset).limit(limit).all()
        
        return RegionListResponse(
            regions=[RegionResponse.from_orm(region) for region in regions],
            total=total,
            page=page,
            limit=limit
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lấy danh sách regions: {str(e)}")

@router.get("/{region_id}", response_model=RegionResponse)
async def get_region(
    region_id: str,
    current_user = Depends(get_current_user_or_company),
    db: Session = Depends(get_db)
):
    """Lấy thông tin chi tiết một vùng đất"""
    try:
        region = db.query(Region).filter(Region.id == region_id).first()
        if not region:
            raise HTTPException(status_code=404, detail="Không tìm thấy vùng đất")
        
        return RegionResponse.from_orm(region)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lấy thông tin region: {str(e)}")

@router.post("/", response_model=RegionResponse)
async def create_region(
    region_data: RegionCreate,
    current_user = Depends(get_current_user_or_company),
    db: Session = Depends(get_db)
):
    """Tạo vùng đất mới"""
    try:
        # Check if region_id already exists
        existing = db.query(Region).filter(Region.region_id == region_data.region_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Region ID đã tồn tại")
        
        # Create new region
        new_region = Region(**region_data.dict())
        db.add(new_region)
        db.commit()
        db.refresh(new_region)
        
        return RegionResponse.from_orm(new_region)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi tạo region: {str(e)}")

@router.put("/{region_id}", response_model=RegionResponse)
async def update_region(
    region_id: str,
    region_data: RegionUpdate,
    current_user = Depends(get_current_user_or_company),
    db: Session = Depends(get_db)
):
    """Cập nhật thông tin vùng đất"""
    try:
        region = db.query(Region).filter(Region.id == region_id).first()
        if not region:
            raise HTTPException(status_code=404, detail="Không tìm thấy vùng đất")
        
        # Update fields
        update_data = region_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(region, field, value)
        
        db.commit()
        db.refresh(region)
        
        return RegionResponse.from_orm(region)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi cập nhật region: {str(e)}")

@router.delete("/{region_id}")
async def delete_region(
    region_id: str,
    current_user = Depends(get_current_user_or_company),
    db: Session = Depends(get_db)
):
    """Xóa vùng đất"""
    try:
        region = db.query(Region).filter(Region.id == region_id).first()
        if not region:
            raise HTTPException(status_code=404, detail="Không tìm thấy vùng đất")
        
        db.delete(region)
        db.commit()
        
        return {"success": True, "message": "Đã xóa vùng đất thành công"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi xóa region: {str(e)}")

@router.post("/bulk-import")
async def bulk_import_regions(
    regions_data: List[RegionCreate],
    current_user = Depends(get_current_user_or_company),
    db: Session = Depends(get_db)
):
    """Import nhiều vùng đất cùng lúc"""
    try:
        created_count = 0
        skipped_count = 0
        
        for region_data in regions_data:
            # Check if region_id already exists
            existing = db.query(Region).filter(Region.region_id == region_data.region_id).first()
            if existing:
                skipped_count += 1
                continue
            
            # Create new region
            new_region = Region(**region_data.dict())
            db.add(new_region)
            created_count += 1
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Import thành công {created_count} vùng đất, bỏ qua {skipped_count} vùng đã tồn tại",
            "created": created_count,
            "skipped": skipped_count
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi import regions: {str(e)}")

@router.post("/seed-demo-data")
async def seed_demo_data(db: Session = Depends(get_db)):
    """Seed demo data - dữ liệu các tỉnh Việt Nam"""
    demo_data = [
        {
            "region_id": 1,
            "region_name": "Thành phố Hồ Chí Minh",
            "area_ha": 2095.0,
            "chm_m": 15.5,
            "vegetation_coverage": 0.65,
            "longitude": 106.6954,
            "latitude": 10.8231,
            "polygon_points": 24
        },
        {
            "region_id": 2,
            "region_name": "Thành phố Hà Nội",
            "area_ha": 3323.6,
            "chm_m": 18.2,
            "vegetation_coverage": 0.72,
            "longitude": 105.8342,
            "latitude": 21.0285,
            "polygon_points": 30
        },
        {
            "region_id": 3,
            "region_name": "Tỉnh An Giang",
            "area_ha": 3536.7,
            "chm_m": 12.8,
            "vegetation_coverage": 0.85,
            "longitude": 105.4368,
            "latitude": 10.3889,
            "polygon_points": 11
        },
        {
            "region_id": 4,
            "region_name": "Tỉnh Đồng Tháp",
            "area_ha": 3377.0,
            "chm_m": 11.5,
            "vegetation_coverage": 0.88,
            "longitude": 105.6412,
            "latitude": 10.4938,
            "polygon_points": 12
        },
        {
            "region_id": 5,
            "region_name": "Tỉnh Cần Thơ",
            "area_ha": 1409.0,
            "chm_m": 13.2,
            "vegetation_coverage": 0.82,
            "longitude": 105.7851,
            "latitude": 10.0452,
            "polygon_points": 9
        },
        {
            "region_id": 6,
            "region_name": "Tỉnh Long An",
            "area_ha": 4494.5,
            "chm_m": 14.1,
            "vegetation_coverage": 0.79,
            "longitude": 106.2431,
            "latitude": 10.6956,
            "polygon_points": 15
        },
        {
            "region_id": 7,
            "region_name": "Tỉnh Đắk Lắk",
            "area_ha": 13125.4,
            "chm_m": 22.8,
            "vegetation_coverage": 0.91,
            "longitude": 108.2378,
            "latitude": 12.7100,
            "polygon_points": 17
        },
        {
            "region_id": 8,
            "region_name": "Tỉnh Lâm Đồng",
            "area_ha": 9773.5,
            "chm_m": 25.6,
            "vegetation_coverage": 0.93,
            "longitude": 108.4265,
            "latitude": 11.5753,
            "polygon_points": 12
        },
        {
            "region_id": 9,
            "region_name": "Tỉnh Nghệ An",
            "area_ha": 16490.9,
            "chm_m": 19.8,
            "vegetation_coverage": 0.75,
            "longitude": 104.9200,
            "latitude": 19.2342,
            "polygon_points": 21
        },
        {
            "region_id": 10,
            "region_name": "Tỉnh Thanh Hóa",
            "area_ha": 11132.8,
            "chm_m": 17.4,
            "vegetation_coverage": 0.68,
            "longitude": 105.7851,
            "latitude": 19.8067,
            "polygon_points": 27
        }
    ]
    
    try:
        created_count = 0
        skipped_count = 0
        
        for region_data in demo_data:
            # Check if region_id already exists
            existing = db.query(Region).filter(Region.region_id == region_data["region_id"]).first()
            if existing:
                skipped_count += 1
                continue
            
            # Create new region
            new_region = Region(
                region_id=region_data["region_id"],
                region_name=region_data["region_name"],
                area_ha=region_data["area_ha"],
                longitude=region_data["longitude"],
                latitude=region_data["latitude"],
                chm_m=region_data["chm_m"],
                vegetation_coverage=region_data["vegetation_coverage"],
                polygon_points=region_data["polygon_points"]
            )
            db.add(new_region)
            created_count += 1
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Seeded {created_count} demo regions, skipped {skipped_count} existing",
            "created": created_count,
            "skipped": skipped_count
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error seeding demo data: {str(e)}")
