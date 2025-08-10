from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from configs.database import get_db
from configs.auth import create_access_token, verify_token, get_password_hash, verify_password
from models.company import Company, CompanyActivityLog, PaymentHistory
from schemas.company import (
    CompanyRegisterRequest, CompanyLoginRequest, CompanyPaymentRequest,
    CompanyRegisterResponse, CompanyLoginResponse, CompanyPaymentResponse,
    CompanyActivityLogRequest, CompanyDashboardResponse,
    PaymentHistoryCreate, PaymentHistoryResponse, PaymentExtendRequest,
    PaymentHistoryListResponse, SubscriptionStatusResponse
)
from datetime import datetime, timedelta
from typing import Optional
import logging
import calendar

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/company", tags=["Company"])
security = HTTPBearer()

# Helper function to get current company
def get_current_company(token: str = Depends(security), db: Session = Depends(get_db)) -> Company:
    try:
        payload = verify_token(token.credentials)
        company_id = payload.get("sub")
        if not company_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Company not found"
            )
        
        return company
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

# Helper function to log company activity
def log_company_activity(
    db: Session, 
    company_id: str, 
    action: str, 
    description: str = None, 
    status: str = "completed",
    request: Request = None
):
    try:
        activity_log = CompanyActivityLog(
            company_id=company_id,
            action=action,
            description=description,
            status=status,
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        db.add(activity_log)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to log activity: {str(e)}")
        db.rollback()

@router.post("/register", response_model=CompanyRegisterResponse)
async def register_company(
    company_data: CompanyRegisterRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Đăng ký tài khoản công ty mới"""
    try:
        # Check if email already exists
        existing_company = db.query(Company).filter(Company.email == company_data.email).first()
        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email đã được sử dụng"
            )
        
        # Hash password
        password_hash = get_password_hash(company_data.password)
        
        # Create new company
        new_company = Company(
            organization_name=company_data.organization_name,
            email=company_data.email,
            password_hash=password_hash
        )
        
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        
        # Log registration activity
        log_company_activity(
            db, new_company.id, 
            "Đăng ký tài khoản", 
            "Hoàn tất đăng ký và tạo tài khoản mới",
            request=request
        )
        
        # Create access token
        access_token = create_access_token(data={"sub": new_company.id})
        
        return CompanyRegisterResponse(
            success=True,
            message="Đăng ký thành công",
            token=access_token,
            company=new_company.to_dict()
        )
        
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã được sử dụng"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Đã có lỗi xảy ra trong quá trình đăng ký"
        )

@router.post("/login", response_model=CompanyLoginResponse)
async def login_company(
    login_data: CompanyLoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Đăng nhập tài khoản công ty"""
    try:
        # Find company by email
        company = db.query(Company).filter(Company.email == login_data.email).first()
        if not company or not verify_password(login_data.password, company.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email hoặc mật khẩu không chính xác"
            )
        
        if not company.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tài khoản đã bị vô hiệu hóa"
            )
        
        # Update login info
        company.last_login = datetime.utcnow()
        company.login_count += 1
        db.commit()
        
        # Log login activity
        log_company_activity(
            db, company.id, 
            "Đăng nhập", 
            "Đăng nhập vào hệ thống",
            request=request
        )
        
        # Create access token
        access_token = create_access_token(data={"sub": company.id})
        
        return CompanyLoginResponse(
            success=True,
            message="Đăng nhập thành công",
            token=access_token,
            company=company.to_dict()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Đã có lỗi xảy ra trong quá trình đăng nhập"
        )

@router.post("/payment", response_model=CompanyPaymentResponse)
async def process_payment(
    payment_data: CompanyPaymentRequest,
    request: Request,
    current_company: Company = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Xử lý thanh toán và cam kết"""
    try:
        if not payment_data.terms_agreed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bạn phải đồng ý với các điều khoản cam kết"
            )
        
        if current_company.payment_completed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tài khoản đã hoàn tất thanh toán"
            )
        
        # Update payment status
        current_company.payment_completed = True
        current_company.payment_date = datetime.utcnow()
        current_company.terms_agreed = True
        current_company.terms_agreed_date = datetime.utcnow()
        
        db.commit()
        
        # Log payment activity
        log_company_activity(
            db, current_company.id, 
            "Hoàn tất thanh toán", 
            f"Thanh toán phí đăng ký {current_company.payment_amount:,} VNĐ và đồng ý điều khoản",
            request=request
        )
        
        return CompanyPaymentResponse(
            success=True,
            message="Thanh toán thành công",
            company=current_company.to_dict()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Payment error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Đã có lỗi xảy ra trong quá trình thanh toán"
        )

@router.get("/dashboard", response_model=CompanyDashboardResponse)
async def get_company_dashboard(
    current_company: Company = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Lấy thông tin dashboard công ty"""
    try:
        # Get activity logs
        activity_logs = db.query(CompanyActivityLog).filter(
            CompanyActivityLog.company_id == current_company.id
        ).order_by(CompanyActivityLog.created_at.desc()).limit(50).all()
        
        # Calculate stats
        stats = {
            "total_activities": len(activity_logs),
            "payment_status": "Đã thanh toán" if current_company.payment_completed else "Chưa thanh toán",
            "account_status": "Hoạt động" if current_company.is_active else "Không hoạt động",
            "login_count": current_company.login_count,
            "member_since": current_company.created_at.strftime("%B %Y") if current_company.created_at else None
        }
        
        return CompanyDashboardResponse(
            company=current_company.to_dict(),
            activity_logs=[log.to_dict() for log in activity_logs],
            stats=stats
        )
        
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không thể tải thông tin dashboard"
        )

@router.post("/activity", response_model=dict)
async def log_activity(
    activity_data: CompanyActivityLogRequest,
    request: Request,
    current_company: Company = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Ghi log hoạt động của công ty"""
    try:
        log_company_activity(
            db, current_company.id,
            activity_data.action,
            activity_data.description,
            activity_data.status,
            request=request
        )
        
        return {"success": True, "message": "Đã ghi log hoạt động"}
        
    except Exception as e:
        logger.error(f"Activity log error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không thể ghi log hoạt động"
        )

@router.get("/profile")
async def get_company_profile(
    current_company: Company = Depends(get_current_company)
):
    """Lấy thông tin profile công ty"""
    return {
        "success": True,
        "company": current_company.to_dict()
    }

# Payment History Endpoints

@router.get("/payment-history", response_model=PaymentHistoryListResponse)
async def get_payment_history(
    page: int = 1,
    limit: int = 10,
    current_company: Company = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Lấy lịch sử thanh toán của công ty với phân trang"""
    try:
        # Validate pagination parameters
        if page < 1:
            page = 1
        if limit < 1 or limit > 100:
            limit = 10
        
        # Calculate offset
        offset = (page - 1) * limit
        
        # Get total count first
        total_count = db.query(PaymentHistory).filter(
            PaymentHistory.company_id == current_company.id
        ).count()
        
        # Get paginated payment history
        payment_history = db.query(PaymentHistory).filter(
            PaymentHistory.company_id == current_company.id
        ).order_by(PaymentHistory.created_at.desc()).offset(offset).limit(limit).all()
        
        # Get all payments for statistics (not paginated)
        all_payments = db.query(PaymentHistory).filter(
            PaymentHistory.company_id == current_company.id
        ).all()
        
        # Calculate statistics
        completed_payments = [p for p in all_payments if p.status == 'completed' and p.payment_type == 'monthly']
        consecutive_payments = len(completed_payments)
        next_bonus_in = 5 - (consecutive_payments % 5) if consecutive_payments % 5 != 0 else 0
        
        # Find current active subscription
        current_period_end = None
        has_active_subscription = False
        
        for payment in all_payments:
            if payment.status in ['active', 'completed'] and payment.period_end:
                if not current_period_end or payment.period_end > current_period_end:
                    current_period_end = payment.period_end
                    has_active_subscription = True
        
        # Calculate pagination info
        total_pages = (total_count + limit - 1) // limit  # Ceiling division
        has_next = page < total_pages
        has_prev = page > 1
        
        return PaymentHistoryListResponse(
            payment_history=[PaymentHistoryResponse.from_orm(p) for p in payment_history],
            total_payments=total_count,
            consecutive_payments=consecutive_payments,
            next_bonus_in=next_bonus_in,
            current_period_end=current_period_end,
            has_active_subscription=has_active_subscription,
            current_page=page,
            total_pages=total_pages,
            has_next=has_next,
            has_prev=has_prev
        )
        
    except Exception as e:
        logger.error(f"Payment history error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không thể lấy lịch sử thanh toán"
        )

@router.get("/subscription-status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    current_company: Company = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    """Lấy trạng thái subscription hiện tại với countdown timer"""
    try:
        # Find the latest active subscription
        latest_payment = db.query(PaymentHistory).filter(
            PaymentHistory.company_id == current_company.id,
            PaymentHistory.status.in_(['active', 'completed'])
        ).order_by(PaymentHistory.period_end.desc()).first()
        
        if not latest_payment or not latest_payment.period_end:
            return SubscriptionStatusResponse(
                is_active=False,
                current_period_end=None,
                days_remaining=0,
                hours_remaining=0,
                minutes_remaining=0,
                seconds_remaining=0,
                next_payment_due=None
            )
        
        # Calculate time remaining
        now = datetime.utcnow()
        time_diff = latest_payment.period_end - now
        
        if time_diff.total_seconds() <= 0:
            # Subscription expired
            return SubscriptionStatusResponse(
                is_active=False,
                current_period_end=latest_payment.period_end,
                days_remaining=0,
                hours_remaining=0,
                minutes_remaining=0,
                seconds_remaining=0,
                next_payment_due=latest_payment.period_end
            )
        
        # Calculate countdown components
        days = time_diff.days
        hours, remainder = divmod(time_diff.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        
        return SubscriptionStatusResponse(
            is_active=True,
            current_period_end=latest_payment.period_end,
            days_remaining=days,
            hours_remaining=hours,
            minutes_remaining=minutes,
            seconds_remaining=seconds,
            next_payment_due=latest_payment.period_end
        )
        
    except Exception as e:
        logger.error(f"Subscription status error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không thể lấy trạng thái subscription"
        )

@router.post("/extend-subscription")
async def extend_subscription(
    payment_request: PaymentExtendRequest,
    current_company: Company = Depends(get_current_company),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Gia hạn subscription cho công ty"""
    try:
        # Find the latest subscription
        latest_payment = db.query(PaymentHistory).filter(
            PaymentHistory.company_id == current_company.id
        ).order_by(PaymentHistory.period_end.desc()).first()
        
        # Calculate new period start and end
        if latest_payment and latest_payment.period_end > datetime.utcnow():
            # Extend from current end date
            period_start = latest_payment.period_end
        else:
            # Start from now if no active subscription
            period_start = datetime.utcnow()
        
        # Calculate end date (add months)
        if period_start.month + payment_request.months <= 12:
            period_end = period_start.replace(month=period_start.month + payment_request.months)
        else:
            # Handle year rollover
            new_year = period_start.year + ((period_start.month + payment_request.months - 1) // 12)
            new_month = ((period_start.month + payment_request.months - 1) % 12) + 1
            period_end = period_start.replace(year=new_year, month=new_month)
        
        # Calculate consecutive payments for bonus tracking
        completed_payments = db.query(PaymentHistory).filter(
            PaymentHistory.company_id == current_company.id,
            PaymentHistory.status == 'completed',
            PaymentHistory.payment_type == 'monthly'
        ).count()
        
        consecutive_count = completed_payments + 1
        is_bonus = consecutive_count % 5 == 0  # Every 5th payment is bonus
        
        # Calculate amount (0 if bonus month)
        base_amount = 500000.0  # 500K VND per month
        amount = 0.0 if is_bonus else base_amount * payment_request.months
        
        # Generate period name
        period_name = f"Tháng {period_start.month}/{period_start.year}"
        if payment_request.months > 1:
            end_month_name = f"{period_end.month}/{period_end.year}"
            period_name = f"Từ {period_name} đến {end_month_name}"
        if is_bonus:
            period_name += " (FREE BONUS)"
        
        # Create payment history record
        new_payment = PaymentHistory(
            company_id=current_company.id,
            amount=amount,
            currency="VND",
            payment_method=payment_request.payment_method,
            period_start=period_start,
            period_end=period_end,
            period_name=period_name,
            payment_type="bonus" if is_bonus else "monthly",
            status="completed",
            is_bonus=is_bonus,
            consecutive_count=consecutive_count,
            payment_date=datetime.utcnow(),
            transaction_id=f"TXN_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{current_company.id[:8]}"
        )
        
        db.add(new_payment)
        db.commit()
        db.refresh(new_payment)
        
        # Log activity
        log_company_activity(
            db, current_company.id,
            "Gia hạn subscription",
            f"Gia hạn {payment_request.months} tháng - {period_name}",
            request=request
        )
        
        return {
            "success": True,
            "message": "Gia hạn thành công" if not is_bonus else "Chúc mừng! Bạn đã nhận được tháng miễn phí",
            "payment": new_payment.to_dict(),
            "is_bonus": is_bonus,
            "next_period_end": period_end.isoformat()
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Extend subscription error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không thể gia hạn subscription"
        )
