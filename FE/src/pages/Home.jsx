import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Layout from '../components/Layout';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        message: ''
    });

    const checkScreenSize = () => {
        setIsMobile(window.innerWidth < 768);
    };

    const handleContactFormChange = (e) => {
        const { name, value } = e.target;
        setContactForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Contact form submitted:', contactForm);
        alert('Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm nhất có thể.');
        setContactForm({ name: '', email: '', message: '' });
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
            <div>
                {/* Hero Video Section */}
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

                            {/* Login Buttons */}
                            <div className="flex space-x-2">
                                <Link
                                    to="/login"
                                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black px-4 py-2 rounded-full border border-white border-opacity-30 transition-all duration-200 backdrop-blur-sm text-sm"
                                >
                                    Nông dân
                                </Link>
                                <Link
                                    to="/company-login"
                                    className="bg-purple-500 bg-opacity-80 hover:bg-opacity-90 text-white px-4 py-2 rounded-full border border-purple-400 border-opacity-50 transition-all duration-200 backdrop-blur-sm text-sm"
                                >
                                    Công ty
                                </Link>
                            </div>
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
                            <p className="text-lg md:text-4xl text-white leading-relaxed font-semibold px-4 drop-shadow-md">
                                Bản đồ rừng tiềm năng Việt Nam – Dữ liệu chuẩn xác, cơ hội xanh vô hạn.
                            </p>
                            <p className="text-lg md:text-regular text-white leading-relaxed font-light px-4 drop-shadow-md">
                            Xác định chính xác vùng đất cho phục hồi và phát triển rừng – nhanh, chuẩn, sẵn sàng cho dự án xanh và tín chỉ các-bon.
                            </p>
                        </div>

                        {/* Call to Action */}
                        <div className="mt-12 space-y-6">
                            <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center">
                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-green-600 to-blue-700 hover:from-green-700 hover:to-blue-800 text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-3 w-full md:w-auto justify-center"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Đăng ký với tư cách nông dân</span>
                                </Link>
                                <Link
                                    to="/company-register"
                                    className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-3 w-full md:w-auto justify-center"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span>Đăng ký với tư cách công ty</span>
                                </Link>
                            </div>
                            <p className="text-gray-200 text-sm text-center max-w-2xl mx-auto opacity-80">
                                Chọn hình thức đăng ký phù hợp với bạn để bắt đầu hành trình carbon credit
                            </p>
                        </div>
                    </div>
                </div>

                {/* Why Choose Our Tool Section - Separate from video */}
                <div className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 py-24 px-6 shadow-2xl border-t border-gray-700">
                    {/* Decorative background patterns */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-72 h-72 bg-green-500 rounded-full filter blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-60"></div>
                    </div>
                    
                    {/* Floating particles effect */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-20 left-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <div className="absolute top-40 right-20 w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
                        <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '3s'}}></div>
                    </div>
                    
                    <div className="relative max-w-6xl mx-auto z-10">
                        {/* Section Header */}
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{
                                textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'
                            }}>
                                Vì sao nên sử dụng công cụ đánh giá tiềm năng của chúng tôi?
                            </h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto rounded-full shadow-lg"></div>
                        </div>

                        {/* Benefits Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Benefit 1 */}
                            <div className="group relative">
                                <div className="bg-white bg-opacity-25 backdrop-blur-md border border-white border-opacity-40 rounded-2xl p-8 h-full hover:bg-opacity-30 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl" style={{
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                                }}>
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-400 transition-colors duration-300">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-slate-700 transition-colors duration-300" style={{
                                                textShadow: '1px 1px 2px rgba(255,255,255,0.3)'
                                            }}>
                                                Tiết kiệm thời gian sàng lọc sơ bộ
                                            </h3>
                                            <p className="text-slate-700 leading-relaxed" style={{
                                                textShadow: '0.5px 0.5px 1px rgba(255,255,255,0.2)'
                                            }}>
                                                Phân tích nhanh chóng các khu vực tiềm năng, giúp tối ưu hóa quy trình đánh giá ban đầu
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Benefit 2 */}
                            <div className="group relative">
                                <div className="bg-white bg-opacity-25 backdrop-blur-md border border-white border-opacity-40 rounded-2xl p-8 h-full hover:bg-opacity-30 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl" style={{
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                                }}>
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-400 transition-colors duration-300">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-slate-700 transition-colors duration-300" style={{
                                                textShadow: '1px 1px 2px rgba(255,255,255,0.3)'
                                            }}>
                                                Giảm chi phí khảo sát thực địa
                                            </h3>
                                            <p className="text-slate-700 leading-relaxed" style={{
                                                textShadow: '0.5px 0.5px 1px rgba(255,255,255,0.2)'
                                            }}>
                                                Xác định chính xác địa điểm cần khảo sát, tránh lãng phí nguồn lực cho các khu vực không phù hợp
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Benefit 3 */}
                            <div className="group relative">
                                <div className="bg-white bg-opacity-25 backdrop-blur-md border border-white border-opacity-40 rounded-2xl p-8 h-full hover:bg-opacity-30 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl" style={{
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                                }}>
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-400 transition-colors duration-300">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-slate-700 transition-colors duration-300" style={{
                                                textShadow: '1px 1px 2px rgba(255,255,255,0.3)'
                                            }}>
                                                Phân tích phù hợp chuẩn quốc tế
                                            </h3>
                                            <p className="text-slate-700 leading-relaxed" style={{
                                                textShadow: '0.5px 0.5px 1px rgba(255,255,255,0.2)'
                                            }}>
                                                Tuân thủ tiêu chuẩn Verra, Gold Standard và các quy chuẩn quốc tế về tín chỉ carbon
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Benefit 4 */}
                            <div className="group relative">
                                <div className="bg-white bg-opacity-25 backdrop-blur-md border border-white border-opacity-40 rounded-2xl p-8 h-full hover:bg-opacity-30 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl" style={{
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                                }}>
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-400 transition-colors duration-300">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-slate-700 transition-colors duration-300" style={{
                                                textShadow: '1px 1px 2px rgba(255,255,255,0.3)'
                                            }}>
                                                Tăng tỷ lệ thành công khi nộp thẩm định
                                            </h3>
                                            <p className="text-slate-700 leading-relaxed" style={{
                                                textShadow: '0.5px 0.5px 1px rgba(255,255,255,0.2)'
                                            }}>
                                                Dữ liệu chính xác và đầy đủ giúp tăng khả năng được chấp thuận trong quá trình thẩm định
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Benefit 5 */}
                            <div className="group relative md:col-span-2 lg:col-span-1">
                                <div className="bg-white bg-opacity-25 backdrop-blur-md border border-white border-opacity-40 rounded-2xl p-8 h-full hover:bg-opacity-30 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl" style={{
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                                }}>
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-400 transition-colors duration-300">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-slate-700 transition-colors duration-300" style={{
                                                textShadow: '1px 1px 2px rgba(255,255,255,0.3)'
                                            }}>
                                                Dễ dàng mở rộng dự án tại thị trường Việt Nam
                                            </h3>
                                            <p className="text-slate-700 leading-relaxed" style={{
                                                textShadow: '0.5px 0.5px 1px rgba(255,255,255,0.2)'
                                            }}>
                                                Hiểu rõ đặc thù địa phương, hỗ trợ phát triển bền vững trong thị trường nội địa
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="group relative md:col-span-2 lg:col-span-1">
                                <div className="bg-white bg-opacity-25 backdrop-blur-md border border-white border-opacity-40 rounded-2xl p-8 h-full hover:bg-opacity-30 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl" style={{
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                                }}>
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-400 transition-colors duration-300">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-slate-700 transition-colors duration-300" style={{
                                                textShadow: '1px 1px 2px rgba(255,255,255,0.3)'
                                            }}>
                                                Dễ dàng mở rộng dự án tại thị trường Việt Nam
                                            </h3>
                                            <p className="text-slate-700 leading-relaxed" style={{
                                                textShadow: '0.5px 0.5px 1px rgba(255,255,255,0.2)'
                                            }}>
                                                Hiểu rõ đặc thù địa phương, hỗ trợ phát triển bền vững trong thị trường nội địa
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom CTA */}
                        <div className="text-center mt-16">
                            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 cursor-pointer border border-white/20" style={{
                                textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
                            }}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <span>Khám phá ngay hôm nay</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Us Section */}
                <div className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 py-24 px-6 shadow-2xl border-t border-gray-700">
                    {/* Decorative Elements */}
                    <div className="absolute top-20 left-10 w-32 h-32 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute top-40 right-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-20 left-1/3 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                    
                    <div className="max-w-4xl mx-auto relative z-10">
                        {/* Section Header */}
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{
                                textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'
                            }}>
                                Liên hệ chúng tôi
                            </h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto rounded-full mb-6"></div>
                            <p className="text-lg text-gray-200 max-w-2xl mx-auto" style={{
                                textShadow: '1px 1px 3px rgba(0,0,0,0.6)'
                            }}>
                                Bạn có dự án hoặc muốn hỗ trợ các giải pháp dựa vào thiên nhiên? Hãy liên hệ với chúng tôi.
                            </p>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 md:p-12" style={{
                            boxShadow: '0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}>
                            <form onSubmit={handleContactSubmit} className="space-y-6">
                                {/* Name Field */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2" style={{
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                    }}>
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={contactForm.name}
                                        onChange={handleContactFormChange}
                                        placeholder="Ngô Xuân Hòa"
                                        className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none shadow-lg hover:shadow-xl focus:shadow-2xl"
                                        style={{
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                                        }}
                                        required
                                    />
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2" style={{
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                    }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={contactForm.email}
                                        onChange={handleContactFormChange}
                                        placeholder="xuanhoa@company.com"
                                        className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none shadow-lg hover:shadow-xl focus:shadow-2xl"
                                        style={{
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                                        }}
                                        required
                                    />
                                </div>

                                {/* Message Field */}
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-2" style={{
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                    }}>
                                        Lời nhắn
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={contactForm.message}
                                        onChange={handleContactFormChange}
                                        rows="6"
                                        placeholder="Hãy chia sẻ với chúng tôi về mục tiêu của bạn."
                                        className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none resize-none shadow-lg hover:shadow-xl focus:shadow-2xl"
                                        style={{
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                                        }}
                                        required
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-start pt-4">
                                    <button
                                        type="submit"
                                        className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-2xl hover:shadow-3xl focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105 border border-white/20"
                                        style={{
                                            textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                                            boxShadow: '0 8px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                                        }}
                                    >
                                        Send message
                                    </button>
                                </div>
                            </form>
                        </div>
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
