from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class CompanyRegisterRequest(BaseModel):
    organization_name: str = Field(..., min_length=2, max_length=255, description="Tên tổ chức hoặc đại diện")
    email: EmailStr = Field(..., description="Email đăng nhập")
    password: str = Field(..., min_length=6, max_length=100, description="Mật khẩu")

class CompanyLoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Email đăng nhập")
    password: str = Field(..., description="Mật khẩu")

class CompanyPaymentRequest(BaseModel):
    company_id: str = Field(..., description="ID công ty")
    terms_agreed: bool = Field(..., description="Đã đồng ý điều khoản")

class CompanyResponse(BaseModel):
    id: str
    organization_name: str
    email: str
    payment_completed: bool
    payment_date: Optional[datetime] = None
    payment_amount: int
    terms_agreed: bool
    terms_agreed_date: Optional[datetime] = None
    is_active: bool
    is_verified: bool
    last_login: Optional[datetime] = None
    login_count: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class CompanyLoginResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    company: Optional[CompanyResponse] = None

class CompanyRegisterResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    company: Optional[CompanyResponse] = None

class CompanyPaymentResponse(BaseModel):
    success: bool
    message: str
    company: Optional[CompanyResponse] = None

class CompanyActivityLogRequest(BaseModel):
    action: str = Field(..., max_length=100, description="Hành động thực hiện")
    description: Optional[str] = Field(None, description="Mô tả chi tiết")
    status: str = Field(default="completed", description="Trạng thái")

class CompanyActivityLogResponse(BaseModel):
    id: str
    company_id: str
    action: str
    description: Optional[str] = None
    status: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CompanyDashboardResponse(BaseModel):
    company: CompanyResponse
    activity_logs: list[CompanyActivityLogResponse]
    stats: dict = Field(default_factory=dict, description="Thống kê dashboard")

# Payment History Schemas
class PaymentHistoryBase(BaseModel):
    amount: float = Field(..., description="Số tiền thanh toán")
    currency: str = Field(default="VND", description="Đơn vị tiền tệ")
    payment_method: Optional[str] = Field(None, description="Phương thức thanh toán")
    period_name: str = Field(..., description="Tên gói dịch vụ")
    payment_type: str = Field(default="monthly", description="Loại thanh toán")

class PaymentHistoryCreate(PaymentHistoryBase):
    period_start: datetime = Field(..., description="Ngày bắt đầu gói dịch vụ")
    period_end: datetime = Field(..., description="Ngày kết thúc gói dịch vụ")

class PaymentHistoryResponse(BaseModel):
    id: str
    company_id: str
    amount: float
    currency: str
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    period_name: str
    payment_type: str
    status: str
    is_bonus: bool
    consecutive_count: int
    payment_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PaymentExtendRequest(BaseModel):
    payment_method: str = Field(..., description="Phương thức thanh toán")
    months: int = Field(default=1, ge=1, le=12, description="Số tháng gia hạn")

class PaymentHistoryListResponse(BaseModel):
    payment_history: list[PaymentHistoryResponse]
    total_payments: int
    consecutive_payments: int
    next_bonus_in: int
    current_period_end: Optional[datetime] = None
    has_active_subscription: bool
    # Pagination info
    current_page: int = 1
    total_pages: int = 1
    has_next: bool = False
    has_prev: bool = False

class SubscriptionStatusResponse(BaseModel):
    is_active: bool
    current_period_end: Optional[datetime] = None
    days_remaining: int
    hours_remaining: int
    minutes_remaining: int
    seconds_remaining: int
    next_payment_due: Optional[datetime] = None
