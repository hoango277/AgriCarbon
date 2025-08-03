import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        frontImage: null,
        backImage: null,
        phoneNumber: ''
    });
    const [previews, setPreviews] = useState({
        front: null,
        back: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                [type === 'front' ? 'frontImage' : 'backImage']: file
            });

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews({
                    ...previews,
                    [type]: e.target.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhoneChange = (e) => {
        setFormData({
            ...formData,
            phoneNumber: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.frontImage || !formData.backImage || !formData.phoneNumber) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Navigate to confirm page with form data
            navigate('/register/confirm', { 
                state: { 
                    frontImage: formData.frontImage,
                    backImage: formData.backImage,
                    phoneNumber: formData.phoneNumber
                }
            });
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra');
            setLoading(false);
        }
    };

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
            {/* Overlay for better text readability */}
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
            <div style={{ position: 'relative', zIndex: 10 }}>
                <div className="max-w-md mx-auto">
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
                                Đăng ký tài khoản
                            </h2>
                            <p 
                                className="text-sm font-semibold text-white"
                                style={{
                                    textShadow: '2px 2px 6px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.6)',
                                    lineHeight: '1.6'
                                }}
                            >
                                Upload ảnh CCCD để đăng ký tài khoản nông dân
                            </p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="bg-white/95 backdrop-blur-sm py-10 px-6 shadow-2xl border border-white/20 sm:rounded-3xl sm:px-12">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                        {error}
                                    </div>
                                )}

                                {/* Front Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ảnh mặt trước CCCD
                                    </label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            {previews.front ? (
                                                <div className="mb-4">
                                                    <img 
                                                        src={previews.front} 
                                                        alt="CCCD mặt trước" 
                                                        className="mx-auto h-32 w-auto object-cover rounded"
                                                    />
                                                </div>
                                            ) : (
                                                <svg
                                                    className="mx-auto h-12 w-12 text-gray-400"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    viewBox="0 0 48 48"
                                                >
                                                    <path
                                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                        strokeWidth={2}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                            <div className="flex text-sm text-gray-600">
                                                <label
                                                    htmlFor="front-image"
                                                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                                >
                                                    <span>Upload ảnh</span>
                                                    <input
                                                        id="front-image"
                                                        name="front-image"
                                                        type="file"
                                                        accept="image/*"
                                                        className="sr-only"
                                                        onChange={(e) => handleFileChange(e, 'front')}
                                                    />
                                                </label>
                                                <p className="pl-1">hoặc kéo thả</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Back Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ảnh mặt sau CCCD
                                    </label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            {previews.back ? (
                                                <div className="mb-4">
                                                    <img 
                                                        src={previews.back} 
                                                        alt="CCCD mặt sau" 
                                                        className="mx-auto h-32 w-auto object-cover rounded"
                                                    />
                                                </div>
                                            ) : (
                                                <svg
                                                    className="mx-auto h-12 w-12 text-gray-400"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    viewBox="0 0 48 48"
                                                >
                                                    <path
                                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                        strokeWidth={2}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                            <div className="flex text-sm text-gray-600">
                                                <label
                                                    htmlFor="back-image"
                                                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                                >
                                                    <span>Upload ảnh</span>
                                                    <input
                                                        id="back-image"
                                                        name="back-image"
                                                        type="file"
                                                        accept="image/*"
                                                        className="sr-only"
                                                        onChange={(e) => handleFileChange(e, 'back')}
                                                    />
                                                </label>
                                                <p className="pl-1">hoặc kéo thả</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                        Số điện thoại
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            required
                                            value={formData.phoneNumber}
                                            onChange={handlePhoneChange}
                                            className="appearance-none block w-full px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-green-500/40 focus:border-green-500 focus:bg-white text-gray-900 font-medium shadow-inner transition-all duration-200"
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Mật khẩu sẽ là: số_điện_thoại@123
                                    </p>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-xl text-base font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200"
                                    >
                                        {loading ? 'Đang xử lý...' : 'Tiếp tục'}
                                    </button>
                                </div>

                                <div className="text-center">
                                    <Link 
                                        to="/login" 
                                        className="text-green-700 hover:text-green-600 text-sm font-semibold underline decoration-2 underline-offset-4 hover:decoration-green-500 transition-all duration-200"
                                    >
                                        Đã có tài khoản? Đăng nhập ngay
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

export default Register;