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
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Đăng ký tài khoản
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Upload ảnh CCCD để đăng ký tài khoản nông dân
                    </p>
                </div>

                <div className="mt-8">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {loading ? 'Đang xử lý...' : 'Tiếp tục'}
                                </button>
                            </div>

                            <div className="text-center">
                                <Link 
                                    to="/login" 
                                    className="text-indigo-600 hover:text-indigo-500 text-sm"
                                >
                                    Đã có tài khoản? Đăng nhập ngay
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 