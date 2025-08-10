import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import CompanyLogin from './pages/CompanyLogin'
import Register from './pages/Register'
import RegisterConfirm from './pages/RegisterConfirm'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import CropDeclaration from './pages/CropDeclaration'
import History from './pages/History'
import AdminDashboard from './pages/AdminDashboard'
import AdminCarbonTracking from './pages/AdminCarbonTracking'
import CarbonTracking from './pages/CarbonTracking'
import CompanyRegister from './pages/CompanyRegister'
import CompanyPayment from './pages/CompanyPayment'
import CompanyDashboard from './pages/CompanyDashboard'
import CompanyProfile from './pages/CompanyProfile'
import CompanyHistory from './pages/CompanyHistory'

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/company-login" element={<CompanyLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/confirm" element={<RegisterConfirm />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/crop-declaration" element={<CropDeclaration />} />
      <Route path="/history" element={<History />} />
      <Route path="/carbon-tracking" element={<CarbonTracking />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/carbon-tracking" element={<AdminCarbonTracking />} />
      <Route path="/company-register" element={<CompanyRegister />} />
      <Route path="/company-payment" element={<CompanyPayment />} />
      <Route path="/company-dashboard" element={<CompanyDashboard />} />
      <Route path="/company-profile" element={<CompanyProfile />} />
      <Route path="/company-history" element={<CompanyHistory />} />
    </Routes>
  )
}

export default Router 