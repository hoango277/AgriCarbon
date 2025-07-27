import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterConfirm from './pages/RegisterConfirm'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/confirm" element={<RegisterConfirm />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/change-password" element={<ChangePassword />} />
    </Routes>
  )
}

export default Router 