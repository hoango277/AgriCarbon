import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Layout from '../components/Layout';

const ChangePassword = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const userInfo = await userAPI.getProfile();
            setUser(userInfo);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear errors when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
    };

    const validateForm = () => {
        if (!formData.currentPassword) {
            setError('Vui lòng nhập mật khẩu hiện tại');
            return false;
        }
        if (!formData.newPassword) {
            setError('Vui lòng nhập mật khẩu mới');
            return false;
        }
        if (formData.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            // Gọi API đổi mật khẩu (sẽ tạo sau)
            await userAPI.changePassword({
                current_password: formData.currentPassword,
                new_password: formData.newPassword
            });

            setSuccess('Đổi mật khẩu thành công!');
            
            // Reset form
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Redirect to profile after 2 seconds
            setTimeout(() => {
                navigate('/profile');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Đổi mật khẩu thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout user={user}>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Đổi mật khẩu</h1>
                    <p className="text-gray-600 mt-1">Cập nhật mật khẩu để bảo mật tài khoản của bạn</p>
                </div>

                {/* Form */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Thay đổi mật khẩu</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Alerts */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                                {success}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Current Password */}
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu hiện tại
                                </label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-green-500/40 focus:border-green-500 focus:bg-white text-gray-900 font-medium shadow-inner transition-all duration-200"
                                    placeholder="Nhập mật khẩu hiện tại"
                                    required
                                />
                            </div>

                            {/* New Password */}
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-green-500/40 focus:border-green-500 focus:bg-white text-gray-900 font-medium shadow-inner transition-all duration-200"
                                    placeholder="Nhập mật khẩu mới"
                                    required
                                />
                                <p className="mt-1 text-sm text-gray-500">Mật khẩu phải có ít nhất 6 ký tự</p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Xác nhận mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-green-500/40 focus:border-green-500 focus:bg-white text-gray-900 font-medium shadow-inner transition-all duration-200"
                                    placeholder="Nhập lại mật khẩu mới"
                                    required
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl transform hover:scale-[1.02] font-semibold"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Đang xử lý...
                                        </div>
                                    ) : (
                                        'Đổi mật khẩu'
                                    )}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => navigate('/profile')}
                                    className="px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg font-semibold bg-white/80 backdrop-blur-sm hover:shadow-xl"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Tips */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                        <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Lưu ý bảo mật</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Sử dụng mật khẩu mạnh với ít nhất 6 ký tự</li>
                                    <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
                                    <li>Thay đổi mật khẩu định kỳ để đảm bảo an toàn</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ChangePassword; 