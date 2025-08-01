import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterConfirm from './pages/RegisterConfirm'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import CropDeclaration from './pages/CropDeclaration'
import History from './pages/History'
import AdminDashboard from './pages/AdminDashboard'

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/confirm" element={<RegisterConfirm />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/crop-declaration" element={<CropDeclaration />} />
      <Route path="/history" element={<History />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  )
}

export default Router 