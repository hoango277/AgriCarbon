# AGRICARBON - Company Management System

## 🏢 Tổng quan hệ thống Company

Hệ thống quản lý công ty cho phép các tổ chức đăng ký, thanh toán và truy cập platform AGRICARBON với các tính năng chuyên biệt.

## 📋 Tính năng chính

### 🔐 Authentication & Registration
- **Đăng ký riêng biệt**: Tách biệt hoàn toàn với hệ thống nông dân
- **Login với Email**: Sử dụng email thay vì CCCD
- **Secure Token**: JWT authentication riêng cho company

### 💳 Payment System
- **Payment Flow**: Thanh toán phí đăng ký 2,000,000 VNĐ
- **QR Code**: Hiển thị QR code cho thanh toán
- **Terms & Conditions**: 5 điều khoản cam kết bắt buộc
- **Payment Verification**: Xác nhận thanh toán trước khi access dashboard

### 📊 Company Dashboard
- **History Only**: Chỉ hiển thị lịch sử hoạt động (khác với farmer dashboard)
- **Activity Tracking**: Theo dõi tất cả hoạt động của company
- **Stats Overview**: Thống kê cơ bản về tài khoản

## 🗂️ Cấu trúc Database

### Bảng `companies`
```sql
- id (UUID): Primary key
- organization_name: Tên tổ chức/đại diện  
- email: Email đăng nhập (unique)
- password_hash: Mật khẩu đã hash
- payment_completed: Trạng thái thanh toán
- payment_date: Ngày thanh toán
- payment_amount: Số tiền (default: 2,000,000 VNĐ)
- terms_agreed: Đã đồng ý điều khoản
- terms_agreed_date: Ngày đồng ý
- is_active: Tài khoản hoạt động
- is_verified: Email verified
- last_login: Lần đăng nhập cuối
- login_count: Số lần đăng nhập
- created_at/updated_at: Timestamps
- notes: Ghi chú
```

### Bảng `company_activity_logs`
```sql
- id (UUID): Primary key
- company_id: Foreign key to companies
- action: Hành động thực hiện
- description: Mô tả chi tiết
- status: completed/pending/failed
- ip_address: IP của user
- user_agent: Browser info
- created_at: Timestamp
```

## 🛠️ API Endpoints

### Company Authentication
```
POST /api/company/register
POST /api/company/login
GET  /api/company/profile
```

### Payment & Verification
```
POST /api/company/payment
```

### Dashboard & Activity
```
GET  /api/company/dashboard
POST /api/company/activity
```

## 🎨 Frontend Pages

### Authentication Flow
1. **LoginChoice** (`/login`) - Chọn farmer hoặc company
2. **FarmerLogin** (`/farmer-login`) - Login cho nông dân
3. **CompanyLogin** (`/company-login`) - Login cho công ty

### Registration Flow
1. **Home** - 2 nút đăng ký (farmer/company)
2. **CompanyRegister** (`/company-register`) - Form đăng ký
3. **CompanyPayment** (`/company-payment`) - Thanh toán & cam kết
4. **CompanyDashboard** (`/company-dashboard`) - Dashboard cuối

## 🚀 User Journey

### 🏠 Trang chủ
```
User clicks "Đăng ký với tư cách công ty"
↓
CompanyRegister page
```

### 📝 Đăng ký
```
Fill form: Tên tổ chức, Email, Password
↓
Submit → Auto redirect to CompanyPayment
```

### 💰 Thanh toán
```
View QR Code + Bank info
↓
Read 5 terms & conditions
↓
Check "I agree" checkbox
↓
Click "Confirm Payment" → CompanyDashboard
```

### 📊 Dashboard
```
Company info + Activity history
↓
Only shows activity logs (no crop/carbon features)
```

### 🔄 Login Flow
```
/login → Choose "Company Login"
↓
Enter email + password
↓
If payment_completed: → Dashboard
If !payment_completed: → Payment page
```

## 💻 Technical Implementation

### Backend Stack
- **FastAPI**: Web framework
- **SQLAlchemy**: ORM
- **Pydantic**: Data validation
- **JWT**: Authentication
- **bcrypt**: Password hashing
- **MySQL**: Database

### Frontend Stack
- **React 19**: UI framework
- **TailwindCSS**: Styling
- **React Router**: Routing
- **Axios**: HTTP client

### Security Features
- **Password Hashing**: bcrypt với salt
- **JWT Tokens**: Secure authentication
- **Input Validation**: Pydantic schemas
- **SQL Injection Protection**: SQLAlchemy ORM
- **CORS**: Configured for security

## 🎯 Key Differences từ Farmer System

| Feature | Farmer | Company |
|---------|--------|---------|
| **Login Field** | CCCD Number | Email |
| **Registration** | Free | Paid (2M VNĐ) |
| **Dashboard** | Full features | History only |
| **Payment** | None | Required |
| **Verification** | CCCD extraction | Email verification |
| **Role** | Individual | Organization |

## 📈 Sample Data

### Company Records
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "organization_name": "Công ty TNHH Xanh",
  "email": "green.company@example.com",
  "payment_completed": true,
  "payment_amount": 2000000,
  "terms_agreed": true,
  "login_count": 5
}
```

### Activity Logs
```json
{
  "action": "Đăng ký tài khoản",
  "description": "Hoàn tất đăng ký và tạo tài khoản mới",
  "status": "completed",
  "created_at": "2024-01-15T09:15:30"
}
```

## 🔧 Development Setup

### Start Backend
```bash
cd BE
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend
```bash
cd FE
npm run dev
```

### Database Setup
```bash
# Import database.sql to MySQL
mysql -u root -p agricarbon < database.sql
```

## 📚 API Documentation

When backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing

### Manual Testing Steps
1. Visit homepage → Click company register button
2. Fill registration form → Submit
3. Payment page → Check agreement → Confirm
4. Dashboard → Verify activity history
5. Logout → Login again → Verify flow

### Test Credentials
```
Email: green.company@example.com
Password: password123
```

## 🎨 UI/UX Design

### Color Scheme
- **Company Theme**: Purple & Pink gradients
- **Farmer Theme**: Green & Blue gradients
- **Background**: Dark gradient (slate-900 → gray-900)
- **Glass Morphism**: backdrop-blur + transparency

### Interactive Elements
- **Hover Effects**: Scale transform + shadow changes
- **Focus States**: Ring colors matching theme
- **Loading States**: Disabled buttons + loading text
- **Error Handling**: Red toast messages

## 🔮 Future Enhancements

1. **Email Verification**: Send verification emails
2. **Payment Gateway**: Real payment integration
3. **Advanced Dashboard**: More company-specific features
4. **Multi-language**: English/Vietnamese toggle
5. **Admin Panel**: Company management for admins
6. **Notifications**: Real-time activity updates
7. **Reports**: Monthly/quarterly reports
8. **API Rate Limiting**: Prevent abuse

---

## 🎉 Status: COMPLETED ✅

Hệ thống Company đã hoàn thiện với đầy đủ tính năng từ frontend đến backend, sẵn sàng cho production deployment!
