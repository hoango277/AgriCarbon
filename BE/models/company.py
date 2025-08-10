from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, ForeignKey, Numeric
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from datetime import datetime
from configs.database import Base
import uuid

class Company(Base):
    __tablename__ = "companies"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_name = Column(String(255), nullable=False, comment="Tên tổ chức hoặc đại diện")
    email = Column(String(255), unique=True, nullable=False, comment="Email đăng nhập")
    password_hash = Column(String(255), nullable=False, comment="Mật khẩu đã hash")
    
    # Payment and status fields
    payment_completed = Column(Boolean, default=False, comment="Đã hoàn tất thanh toán")
    payment_date = Column(DateTime, nullable=True, comment="Ngày thanh toán")
    payment_amount = Column(Integer, default=2000000, comment="Số tiền thanh toán (VNĐ)")
    
    # Agreement and compliance
    terms_agreed = Column(Boolean, default=False, comment="Đã đồng ý điều khoản")
    terms_agreed_date = Column(DateTime, nullable=True, comment="Ngày đồng ý điều khoản")
    
    # Account status
    is_active = Column(Boolean, default=True, comment="Tài khoản hoạt động")
    is_verified = Column(Boolean, default=False, comment="Đã xác thực email")
    
    # Activity tracking
    last_login = Column(DateTime, nullable=True, comment="Lần đăng nhập cuối")
    login_count = Column(Integer, default=0, comment="Số lần đăng nhập")
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, comment="Ngày tạo")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="Ngày cập nhật")
    
    # Additional info
    notes = Column(Text, nullable=True, comment="Ghi chú thêm")
    
    # Relationships
    payment_history = relationship("PaymentHistory", back_populates="company", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Company(id={self.id}, organization_name={self.organization_name}, email={self.email})>"
    
    def to_dict(self):
        """Convert company object to dictionary"""
        return {
            "id": self.id,
            "organization_name": self.organization_name,
            "email": self.email,
            "payment_completed": self.payment_completed,
            "payment_date": self.payment_date.isoformat() if self.payment_date else None,
            "payment_amount": self.payment_amount,
            "terms_agreed": self.terms_agreed,
            "terms_agreed_date": self.terms_agreed_date.isoformat() if self.terms_agreed_date else None,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "login_count": self.login_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "notes": self.notes
        }


class CompanyActivityLog(Base):
    __tablename__ = "company_activity_logs"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(CHAR(36), nullable=False, comment="ID công ty")
    action = Column(String(100), nullable=False, comment="Hành động thực hiện")
    description = Column(Text, nullable=True, comment="Mô tả chi tiết")
    status = Column(String(20), default="completed", comment="Trạng thái: completed, pending, failed")
    
    # Metadata
    ip_address = Column(String(45), nullable=True, comment="Địa chỉ IP")
    user_agent = Column(Text, nullable=True, comment="User agent")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, comment="Thời gian thực hiện")
    
    def __repr__(self):
        return f"<CompanyActivityLog(id={self.id}, company_id={self.company_id}, action={self.action})>"
    
    def to_dict(self):
        """Convert activity log to dictionary"""
        return {
            "id": self.id,
            "company_id": self.company_id,
            "action": self.action,
            "description": self.description,
            "status": self.status,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class PaymentHistory(Base):
    __tablename__ = "payment_history"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(CHAR(36), ForeignKey('companies.id'), nullable=False, comment="ID công ty")
    
    # Payment details
    amount = Column(Numeric(15, 2), nullable=False, comment="Số tiền thanh toán")
    currency = Column(String(10), default="VND", comment="Đơn vị tiền tệ")
    payment_method = Column(String(50), nullable=True, comment="Phương thức thanh toán")
    transaction_id = Column(String(255), nullable=True, comment="Mã giao dịch")
    
    # Subscription period
    period_start = Column(DateTime, nullable=False, comment="Ngày bắt đầu gói dịch vụ")
    period_end = Column(DateTime, nullable=False, comment="Ngày kết thúc gói dịch vụ")
    period_name = Column(String(100), nullable=False, comment="Tên gói dịch vụ (VD: Tháng 1/2024)")
    
    # Payment type and status
    payment_type = Column(String(20), default="monthly", comment="Loại thanh toán: monthly, free, bonus")
    status = Column(String(20), default="pending", comment="Trạng thái: pending, completed, failed, active")
    is_bonus = Column(Boolean, default=False, comment="Có phải tháng miễn phí bonus không")
    
    # Consecutive tracking for bonus
    consecutive_count = Column(Integer, default=0, comment="Số lần thanh toán liên tiếp")
    
    # Metadata
    payment_date = Column(DateTime, nullable=True, comment="Ngày thanh toán thực tế")
    created_at = Column(DateTime, default=datetime.utcnow, comment="Ngày tạo")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="Ngày cập nhật")
    
    # Relationships
    company = relationship("Company", back_populates="payment_history")
    
    def to_dict(self):
        """Convert payment history to dictionary"""
        return {
            "id": self.id,
            "company_id": self.company_id,
            "amount": float(self.amount) if self.amount else 0,
            "currency": self.currency,
            "payment_method": self.payment_method,
            "transaction_id": self.transaction_id,
            "period_start": self.period_start.isoformat() if self.period_start else None,
            "period_end": self.period_end.isoformat() if self.period_end else None,
            "period_name": self.period_name,
            "payment_type": self.payment_type,
            "status": self.status,
            "is_bonus": self.is_bonus,
            "consecutive_count": self.consecutive_count,
            "payment_date": self.payment_date.isoformat() if self.payment_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
