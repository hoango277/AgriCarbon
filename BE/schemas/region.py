from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class RegionBase(BaseModel):
    region_name: str = Field(..., description="Tên vùng")
    area_ha: float = Field(default=0.0, description="Diện tích (ha)")
    longitude: float = Field(..., description="Kinh độ")
    latitude: float = Field(..., description="Vĩ độ")
    chm_m: Optional[float] = Field(None, description="CHM (m)")
    vegetation_coverage: Optional[float] = Field(None, description="Độ phủ thực vật (%)")
    polygon_points: int = Field(default=0, description="Số điểm POLYGON")

class RegionCreate(RegionBase):
    region_id: int = Field(..., description="ID vùng gốc")

class RegionUpdate(BaseModel):
    region_name: Optional[str] = None
    area_ha: Optional[float] = None
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    chm_m: Optional[float] = None
    vegetation_coverage: Optional[float] = None
    polygon_points: Optional[int] = None

class RegionResponse(RegionBase):
    id: str
    region_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class RegionListResponse(BaseModel):
    regions: list[RegionResponse]
    total: int
    page: int = 1
    limit: int = 100
