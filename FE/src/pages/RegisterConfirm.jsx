import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';

const RegisterConfirm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [cccdInfo, setCccdInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState('');
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Check if we have the required data
        if (!location.state?.frontImage || !location.state?.backImage || !location.state?.phoneNumber) {
            navigate('/register');
            return;
        }

        // Only process once
        if (!hasProcessed.current) {
            hasProcessed.current = true;
            processCCCDImages();
        }
    }, []);

    const processCCCDImages = async () => {
        try {
            setLoading(true);
            const { frontImage, backImage, phoneNumber } = location.state;
            
            // Validation
            if (!frontImage || !backImage) {
                throw new Error('Thiếu ảnh CCCD');
            }

            const formData = new FormData();
            formData.append('front_image', frontImage);
            formData.append('back_image', backImage);

            console.log('FormData contents:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            // Call API to extract CCCD info
            const response = await userAPI.extractCCCDInfo(formData);
            setCccdInfo({
                ...response,
                phoneNumber
            });
        } catch (err) {
            console.error('Error processing CCCD:', err);
            setError(err.message || 'Không thể xử lý ảnh CCCD. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        try {
            setRegistering(true);
            const { phoneNumber } = location.state;
            
            if (!cccdInfo) {
                throw new Error('Không có thông tin CCCD để đăng ký');
            }

            // Create user data from extracted CCCD info
            const userData = {
                full_name: cccdInfo.full_name,
                birth_date: cccdInfo.birth_date,
                gender: cccdInfo.gender,
                cccd: cccdInfo.cccd,
                current_address: cccdInfo.current_address,
                hometown: cccdInfo.hometown,
                issue_date: cccdInfo.issue_date,
                issue_place: cccdInfo.issue_place,
                phone_number: phoneNumber
            };

            console.log('Registering user with data:', userData);

            // Register user
            await userAPI.register(userData);
            
            // Show success message and redirect to login
            alert('Đăng ký thành công! Vui lòng đăng nhập với mật khẩu: ' + phoneNumber + '@123');
            navigate('/login');
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Đăng ký thất bại');
        } finally {
            setRegistering(false);
        }
    };

    const handleBack = () => {
        navigate('/register');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <div 
                className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8"
                style={{
                    position: 'relative',
                    backgroundImage: 'url("/register.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '100vh'
                }}
            >
                {/* Overlay */}
                <div 
                    style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        zIndex: 1
                    }}
                ></div>
                
                {/* Loading Content */}
                <div className="relative" style={{ zIndex: 10 }}>
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        {/* Loading Header with Logo */}
                        <div className="text-center mb-8">
                            <div 
                                className="bg-white/15 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/20 mx-auto inline-block"
                                style={{ 
                                    maxWidth: '600px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}
                            >
                                {/* Logo */}
                                <div className="flex justify-center mb-4">
                                    <img 
                                        src="/logo.jpg" 
                                        alt="AgriCarbon" 
                                        className="w-20 h-12 rounded-xl shadow-lg object-cover"
                                        style={{
                                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                                        }}
                                    />
                                </div>
                                <h2 
                                    className="text-2xl md:text-3xl font-extrabold text-white mb-3"
                                    style={{
                                        textShadow: '3px 3px 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7), 0 0 30px rgba(255,255,255,0.1)',
                                        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))',
                                        letterSpacing: '1px'
                                    }}
                                >
                                    Đang xử lý
                                </h2>
                                <p 
                                    className="text-sm font-semibold text-white"
                                    style={{
                                        textShadow: '2px 2px 6px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.6)',
                                        lineHeight: '1.6'
                                    }}
                                >
                                    AI đang trích xuất thông tin từ CCCD của bạn
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-white/95 backdrop-blur-sm py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                <p className="mt-4 text-gray-700 font-medium">AI đang trích xuất dữ liệu từ CCCD...</p>
                                <p className="mt-2 text-sm text-gray-500">Vui lòng đợi trong giây lát</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
            style={{
                position: 'relative',
                backgroundImage: 'url("/register.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '100vh'
            }}
        >
            {/* Overlay */}
            <div 
                style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    zIndex: 1
                }}
            ></div>
            
            {/* Content */}
            <div className="relative" style={{ zIndex: 10 }}>
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <div 
                            className="bg-white/15 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/20 mx-auto inline-block"
                            style={{ 
                                maxWidth: '700px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}
                        >
                            {/* Logo */}
                            <div className="flex justify-center mb-4">
                                <img 
                                    src="/logo.jpg" 
                                    alt="AgriCarbon" 
                                    className="w-20 h-12 rounded-xl shadow-lg object-cover"
                                    style={{
                                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                                    }}
                                />
                            </div>
                            <h2 
                                className="text-2xl md:text-3xl font-extrabold text-white mb-3"
                                style={{
                                    textShadow: '3px 3px 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7), 0 0 30px rgba(255,255,255,0.1)',
                                    filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))',
                                    letterSpacing: '1px'
                                }}
                            >
                                Xác nhận thông tin
                            </h2>
                            <p 
                                className="text-sm font-semibold text-white"
                                style={{
                                    textShadow: '2px 2px 6px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.6)',
                                    lineHeight: '1.6'
                                }}
                            >
                                Vui lòng kiểm tra thông tin từ CCCD và xác nhận để hoàn tất đăng ký
                            </p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="bg-white/95 backdrop-blur-sm py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {cccdInfo ? (
                            <div className="space-y-6">
                                <div className="border-b border-gray-200 pb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Thông tin từ CCCD mặt trước
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Họ và tên
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                                {cccdInfo.full_name || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Ngày sinh
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                                {formatDate(cccdInfo.birth_date)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Giới tính
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                                {cccdInfo.gender || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Số CCCD
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                                {cccdInfo.cccd || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Quê quán
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                            {cccdInfo.hometown || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Nơi thường trú
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                            {cccdInfo.current_address || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-b border-gray-200 pb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Thông tin từ CCCD mặt sau
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Ngày cấp
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                                {formatDate(cccdInfo.issue_date)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Nơi cấp
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                                {cccdInfo.issue_place || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Thông tin bổ sung
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Số điện thoại
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                                {cccdInfo.phoneNumber}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Mật khẩu mặc định
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                                {cccdInfo.phoneNumber}@123
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-xl shadow-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirm}
                                        disabled={registering}
                                        className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                                    >
                                        {registering ? 'Đang đăng ký...' : 'Xác nhận đăng ký'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Không thể lấy thông tin từ CCCD</p>
                                <button
                                    onClick={handleBack}
                                    className="mt-4 text-indigo-600 hover:text-indigo-500"
                                >
                                    Quay lại trang đăng ký
                                </button>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterConfirm; 