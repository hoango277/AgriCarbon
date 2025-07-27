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
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Đang xử lý ảnh CCCD...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Xác nhận thông tin
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Vui lòng kiểm tra thông tin từ CCCD và xác nhận để hoàn tất đăng ký
                    </p>
                </div>

                <div className="mt-8">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                                        className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirm}
                                        disabled={registering}
                                        className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
    );
};

export default RegisterConfirm; 