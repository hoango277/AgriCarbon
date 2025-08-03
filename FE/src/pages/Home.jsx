import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../services/api';
import Layout from '../components/Layout';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);

    const checkScreenSize = () => {
        setIsMobile(window.innerWidth < 768);
    };

    const checkAuth = useCallback(async () => {
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
            } catch {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, [navigate]);

    useEffect(() => {
        checkAuth();
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, [checkAuth]);

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
            <div className="relative min-h-screen overflow-hidden">
                {/* Video Background Layer */}
                <div className="absolute inset-0" style={{ zIndex: 1 }}>
                    <video
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        onError={(e) => {
                            console.error('❌ Video failed to load:', e.target.error);
                            setVideoLoaded(false);
                        }}
                        onLoadStart={() => console.log('⏳ Video loading started')}
                        onCanPlay={() => {
                            console.log('✅ Video can play now');
                            setVideoLoaded(true);
                        }}
                        onLoadedData={() => console.log('✅ Video loaded successfully')}
                        onPlay={() => console.log('▶️ Video started playing')}
                    >
                        <source src={isMobile ? "/phone.mp4" : "/pc.mp4"} type="video/mp4" />
                    </video>
                </div>

                {/* Fallback Background Image (only show if video fails) */}
                {!videoLoaded && (
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop")`,
                            zIndex: 0
                        }}
                    ></div>
                )}
                
                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/40" style={{ zIndex: 2 }}></div>

                {/* Navigation */}
                <nav className="relative p-6" style={{ zIndex: 10 }}>
                    <div className="flex justify-between items-center">
                        {/* Menu Button */}
                        <button 
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-white hover:bg-white hover:bg-opacity-20 p-3 rounded-md transition-all duration-200"
                        >
                            <div className="space-y-1">
                                <div className="w-6 h-0.5 bg-white"></div>
                                <div className="w-6 h-0.5 bg-white"></div>
                                <div className="w-6 h-0.5 bg-white"></div>
                            </div>
                        </button>

                        {/* Menu Text */}
                        <span className="text-white font-semibold text-lg tracking-wider ml-4">MENU</span>

                        {/* Login Button */}
                        <Link
                            to="/login"
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black px-6 py-2 rounded-full border border-white border-opacity-30 transition-all duration-200 backdrop-blur-sm"
                        >
                            Đăng nhập
                        </Link>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="relative flex flex-col items-center justify-center min-h-[80vh] px-6 text-center" style={{ zIndex: 10 }}>
                    {/* Logo */}
                    <div className="mb-8">
                        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-[0.2em] mb-4 drop-shadow-lg">
                            AGRICACBON
                        </h1>
                        <p className="text-xl md:text-2xl text-white tracking-[0.3em] font-light">
                            AT THE HEART OF NATURE
                        </p>
                    </div>

                    {/* Description */}
                    <div className="max-w-4xl mx-auto mt-12">
                        <p className="text-lg md:text-xl text-white leading-relaxed font-light px-4 drop-shadow-md">
                            Agricacbon exists to help people prosper from conserving their forests 
                            and wildlife, resulting in climate change mitigation for the benefit of 
                            all. We mobilize transformative investments, through the sale of 
                            verified carbon credits and conservation finance, to protect and restore 
                            nature's most critical ecosystems.
                        </p>
                    </div>

                    {/* Call to Action */}
                    <div className="mt-12 space-x-4">
                        <Link
                            to="/register"
                            className="bg-white text-gray-900 px-8 py-3 rounded-full text-lg font-medium hover:bg-opacity-90 transition-all duration-200 shadow-lg"
                        >
                            Bắt đầu
                        </Link>
                    </div>
                </div>

                {/* Side Menu */}
                {menuOpen && (
                    <div className="fixed inset-0" style={{ zIndex: 50 }}>
                        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMenuOpen(false)}></div>
                        <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
                                    <button 
                                        onClick={() => setMenuOpen(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <nav className="space-y-4">
                                    <Link to="/login" className="block py-3 px-4 text-lg text-gray-700 hover:bg-gray-100 rounded-md">
                                        Đăng nhập
                                    </Link>
                                    <Link to="/register" className="block py-3 px-4 text-lg text-gray-700 hover:bg-gray-100 rounded-md">
                                        Đăng ký
                                    </Link>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
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