import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAPI } from '../services/api';

const Login = () => {
    const [formData, setFormData] = useState({
        cccd: '',
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
            // Create FormData for OAuth2PasswordRequestForm
            const loginData = new FormData();
            loginData.append('username', formData.cccd); // OAuth2 uses 'username' field
            loginData.append('password', formData.password);

            const response = await userAPI.login(loginData);
            
            // Save token to localStorage
            localStorage.setItem('token', response.access_token);
            
            // Redirect to home page
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Image (Desktop only) */}
            <div className="hidden lg:flex lg:w-1/2">
                <div 
                    className="w-full bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url("/login.jpg")'
                    }}
                ></div>
            </div>

            {/* Right side - Login Form */}
            <div 
                className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 xl:px-20 bg-white relative"
            >
                {/* Mobile background only */}
                <div 
                    className="absolute inset-0 lg:hidden"
                    style={{
                        backgroundImage: 'url("/login.jpg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        zIndex: 0
                    }}
                ></div>
                {/* Mobile overlay */}
                <div 
                    className="absolute inset-0 lg:hidden"
                    style={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        zIndex: 1
                    }}
                ></div>
                
                {/* Content */}
                <div className="relative z-10">
                    <div className="mx-auto w-full max-w-md">
                        {/* Mobile Header with Background */}
                        <div className="lg:hidden text-center mb-8">
                            <div 
                                className="bg-white/15 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/20 mx-auto inline-block"
                                style={{ 
                                    maxWidth: '400px',
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
                                    Đăng nhập
                                </h2>
                                <p 
                                    className="text-sm font-semibold text-white"
                                    style={{
                                        textShadow: '2px 2px 6px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.6)',
                                        lineHeight: '1.6'
                                    }}
                                >
                                    Sử dụng số CCCD và mật khẩu để đăng nhập vào hệ thống
                                </p>
                            </div>
                        </div>

                        {/* Desktop Header (Original) */}
                        <div className="hidden lg:block">
                            {/* Logo */}
                            <div className="flex justify-center mb-6">
                                <img 
                                    src="/logo.jpg" 
                                    alt="AgriCarbon" 
                                    className="w-24 h-14 rounded-xl shadow-lg object-cover"
                                />
                            </div>
                            <h2 
                                className="mt-6 text-3xl font-extrabold text-gray-900 text-center"
                                style={{
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                                }}
                            >
                                Đăng nhập
                            </h2>
                            <p 
                                className="mt-2 text-sm text-gray-600 text-center"
                                style={{
                                    textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            >
                                Sử dụng số CCCD và mật khẩu để đăng nhập vào hệ thống
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 mx-auto w-full max-w-md">
                        <div className="bg-white/95 backdrop-blur-sm lg:bg-white lg:backdrop-blur-none py-10 px-6 shadow-2xl lg:shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/20 lg:border-gray-200 sm:rounded-3xl lg:rounded-2xl sm:px-12 lg:border-2">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg shadow-sm">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="cccd" className="block text-sm font-medium text-gray-700">
                                Số CCCD
                            </label>
                            <div className="mt-1">
                                <input
                                    id="cccd"
                                    name="cccd"
                                    type="text"
                                    required
                                    value={formData.cccd}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-green-500/40 focus:border-green-500 focus:bg-white text-gray-900 font-medium shadow-inner lg:shadow-md transition-all duration-200"
                                    placeholder="Nhập số CCCD"
                                    style={{
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mật khẩu
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-green-500/40 focus:border-green-500 focus:bg-white text-gray-900 font-medium shadow-inner lg:shadow-md transition-all duration-200"
                                    placeholder="Nhập mật khẩu"
                                    style={{
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Mật khẩu mặc định: số_điện_thoại@123
                            </p>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-xl lg:shadow-[0_8px_25px_rgba(34,197,94,0.3)] text-base font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] lg:hover:shadow-[0_12px_35px_rgba(34,197,94,0.4)] transition-all duration-200"
                                style={{
                                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                                }}
                            >
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link 
                                to="/register" 
                                className="text-green-700 hover:text-green-600 text-sm font-semibold underline decoration-2 underline-offset-4 hover:decoration-green-500 transition-all duration-200"
                            >
                                Chưa có tài khoản? Đăng ký ngay
                            </Link>
                        </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 