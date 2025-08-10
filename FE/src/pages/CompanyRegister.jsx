import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';

const CompanyRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        organizationName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            const response = await axiosInstance.post('/company/register', {
                organization_name: formData.organizationName,
                email: formData.email,
                password: formData.password
            });

            if (response.success) {
                localStorage.setItem('company_token', response.token);
                localStorage.setItem('company_data', JSON.stringify(response.company));
                navigate('/company-payment');
            }
        } catch (error) {
            setError(error.response?.data?.detail || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-6">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-10"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-6">
                        <div className="flex items-center justify-center space-x-3">
                            <img 
                                src="/logo.jpg" 
                                alt="AgriCarbon" 
                                className="w-12 h-7 rounded-lg shadow-xl object-cover"
                                style={{
                                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                                }}
                            />
                            <h1 className="text-3xl font-bold text-white">AGRICARBON</h1>
                        </div>
                    </Link>
                    <h2 className="text-2xl font-bold text-white mb-2">Đăng ký tài khoản công ty</h2>
                    <p className="text-gray-300">Tham gia hệ sinh thái carbon credit với tư cách tổ chức</p>
                </div>

                {/* Registration Form */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl" style={{
                    boxShadow: '0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Organization Name */}
                        <div>
                            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-200 mb-2">
                                Tên tổ chức / Đại diện
                            </label>
                            <input
                                type="text"
                                id="organizationName"
                                name="organizationName"
                                value={formData.organizationName}
                                onChange={handleChange}
                                placeholder="Công ty TNHH ABC / Nguyễn Văn A"
                                className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none shadow-lg"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="company@example.com"
                                className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none shadow-lg"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Ít nhất 6 ký tự"
                                className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none shadow-lg"
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu"
                                className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none shadow-lg"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                            {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-300 text-sm">
                            Đã có tài khoản?{' '}
                            <Link to="/company-login" className="text-purple-400 hover:text-purple-300 font-medium">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                        ← Quay về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CompanyRegister;
