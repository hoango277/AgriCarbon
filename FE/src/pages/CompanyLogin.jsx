import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../config/axios';

const CompanyLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        // Clear error when user starts typing
        if (error) {
            setError('');
        }
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axiosInstance.post('/company/login', {
                email: formData.email,
                password: formData.password
            });

            if (response.success) {
                // Save token to localStorage
                localStorage.setItem('company_token', response.token);
                localStorage.setItem('company_data', JSON.stringify(response.company));
                
                // Check if payment is completed
                const paymentCompleted = response.company.payment_completed;
                if (paymentCompleted) {
                    localStorage.setItem('company_payment_completed', 'true');
                    navigate('/company-dashboard');
                } else {
                    navigate('/company-payment');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.detail || 'Đăng nhập thất bại. Vui lòng thử lại.');
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
                    <h2 className="text-2xl font-bold text-white mb-2">Đăng nhập công ty</h2>
                    <p className="text-gray-300">Nhập email và mật khẩu của tổ chức</p>
                </div>

                {/* Login Form */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl" style={{
                    boxShadow: '0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

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
                                placeholder="Nhập mật khẩu"
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
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-300 text-sm">
                            Chưa có tài khoản?{' '}
                            <Link to="/company-register" className="text-purple-400 hover:text-purple-300 font-medium">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back Links */}
                <div className="text-center mt-6">
                    <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                        ← Quay về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CompanyLogin;
