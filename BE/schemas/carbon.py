from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class CarbonTrackingBase(BaseModel):
    crop_declaration_id: int
    week_start_date: date
    week_end_date: date
    carbon_credits: float
    measured_at: datetime


class CarbonTrackingCreate(CarbonTrackingBase):
    pass


class CarbonTrackingUpdate(BaseModel):
    carbon_credits: Optional[float] = None
    measured_at: Optional[datetime] = None


class CarbonTrackingResponse(CarbonTrackingBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class WeeklyCarbonData(BaseModel):
    """Schema để trả về dữ liệu carbon theo tuần cho chart"""
    week_start: str  # Format: "2024-01-01"
    week_end: str    # Format: "2024-01-07" 
    carbon_credits: float
    week_label: str  # Format: "Tuần 1 - 2024"


class CarbonSummary(BaseModel):
    """Tổng hợp dữ liệu carbon cho một vùng đất"""
    crop_declaration_id: int
    area_name: str
    total_carbon_credits: float
    average_weekly_credits: float
    total_weeks: int
    latest_measurement: Optional[datetime] = None
    weekly_data: list[WeeklyCarbonData]