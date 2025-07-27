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
            setError(err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Đăng nhập
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sử dụng số CCCD và mật khẩu để đăng nhập
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
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
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Nhập số CCCD"
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
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Nhập mật khẩu"
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
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link 
                                to="/register" 
                                className="text-indigo-600 hover:text-indigo-500 text-sm"
                            >
                                Chưa có tài khoản? Đăng ký ngay
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login; 