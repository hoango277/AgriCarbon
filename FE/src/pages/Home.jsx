import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import Layout from '../components/Layout';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userInfo = await userAPI.getProfile();
                setUser(userInfo);
                
                // Redirect admin to admin dashboard
                if (userInfo.role === 'admin') {
                    navigate('/admin');
                    return;
                }
            } catch (error) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // If user is not logged in, show landing page
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Chào mừng đến với AgriCarbon
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Hệ thống quản lý carbon nông nghiệp và thông tin nông dân
                    </p>
                    <div className="space-x-4">
                        <Link
                            to="/register"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md text-lg font-medium transition-colors duration-200"
                        >
                            Đăng ký ngay
                        </Link>
                        <Link
                            to="/login"
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-md text-lg font-medium transition-colors duration-200"
                        >
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // If user is logged in, show dashboard with Layout
    return (
        <Layout user={user}>
            <div className="max-w-4xl mx-auto">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Xin chào, {user.full_name}!
                    </h1>
                    <p className="text-gray-600 mt-1">Chào mừng bạn quay trở lại với hệ thống AgriCarbon</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Tài khoản</p>
                                <p className="text-lg font-semibold text-gray-900">Đã kích hoạt</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">CCCD</p>
                                <p className="text-lg font-semibold text-gray-900">Đã xác thực</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                                <p className="text-lg font-semibold text-gray-900">{user.phone_number}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Thao tác nhanh</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link
                                to="/profile"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <svg className="w-6 h-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Thông tin cá nhân</p>
                                    <p className="text-xs text-gray-500">Xem và cập nhật thông tin</p>
                                </div>
                            </Link>

                            <Link
                                to="/change-password"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Đổi mật khẩu</p>
                                    <p className="text-xs text-gray-500">Cập nhật mật khẩu bảo mật</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Home;