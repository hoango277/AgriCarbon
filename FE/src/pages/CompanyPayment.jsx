import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CompanyPayment = () => {
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    const commitments = [
        "Cam kết tuân thủ các tiêu chuẩn quốc tế về carbon credit (Verra, Gold Standard)",
        "Thực hiện đúng quy trình đánh giá và giám sát dự án theo quy định",
        "Cung cấp thông tin chính xác và minh bạch về hoạt động của tổ chức",
        "Hỗ trợ phát triển bền vững các dự án carbon tại Việt Nam",
        "Tuân thủ các quy định pháp luật về môi trường và khí hậu"
    ];

    const handleConfirmPayment = async () => {
        if (!agreed) {
            alert('Vui lòng chấp thuận các điều khoản cam kết');
            return;
        }

        setLoading(true);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Set company as paid
            localStorage.setItem('company_payment_completed', 'true');
            
            alert('Thanh toán thành công! Chào mừng bạn đến với AGRICARBON');
            navigate('/company-dashboard');
        } catch (error) {
            alert('Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.');
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

            <div className="relative z-10 w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-4">Hoàn tất đăng ký</h1>
                    <p className="text-gray-300">Thanh toán phí đăng ký và cam kết tuân thủ quy định</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Payment Section */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl" style={{
                        boxShadow: '0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}>
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">Thanh toán</h2>
                        
                        {/* Payment Info */}
                        <div className="bg-white/5 rounded-lg p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-300">Phí đăng ký tài khoản công ty:</span>
                                <span className="text-2xl font-bold text-white">2,000,000 VNĐ</span>
                            </div>
                            <div className="text-sm text-gray-400">
                                Bao gồm: Truy cập đầy đủ hệ thống, hỗ trợ kỹ thuật 24/7, và báo cáo chi tiết
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="text-center mb-6">
                            <div className="bg-white p-6 rounded-lg inline-block shadow-lg">
                                <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm">
                                    QR CODE
                                    <br />
                                    Quét để thanh toán
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm mt-3">
                                Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                            </p>
                        </div>

                        {/* Bank Info */}
                        <div className="bg-white/5 rounded-lg p-4 text-sm text-gray-300">
                            <p><strong>Ngân hàng:</strong> Vietcombank</p>
                            <p><strong>Số tài khoản:</strong> 1234567890</p>
                            <p><strong>Chủ tài khoản:</strong> AGRICARBON VIETNAM</p>
                            <p><strong>Nội dung:</strong> DANGKY [EMAIL_CUA_BAN]</p>
                        </div>
                    </div>

                    {/* Commitments Section */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl" style={{
                        boxShadow: '0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}>
                        <h2 className="text-2xl font-bold text-white mb-6">Điều khoản cam kết</h2>
                        
                        <div className="space-y-4 mb-8">
                            {commitments.map((commitment, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-200 text-sm leading-relaxed">{commitment}</p>
                                </div>
                            ))}
                        </div>

                        {/* Agreement Checkbox */}
                        <div className="mb-6">
                            <label className="flex items-start space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="w-5 h-5 text-purple-600 bg-white/90 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mt-0.5"
                                />
                                <span className="text-gray-200 text-sm">
                                    Tôi đã đọc, hiểu và đồng ý tuân thủ tất cả các điều khoản cam kết trên. Tôi cam kết sử dụng dịch vụ một cách có trách nhiệm và tuân thủ đầy đủ các quy định.
                                </span>
                            </label>
                        </div>

                        {/* Confirm Button */}
                        <button
                            onClick={handleConfirmPayment}
                            disabled={!agreed || loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                            {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán & Hoàn tất đăng ký'}
                        </button>

                        <p className="text-gray-400 text-xs text-center mt-4">
                            Bằng cách nhấn "Xác nhận", bạn xác nhận đã hoàn tất thanh toán
                        </p>
                    </div>
                </div>

                {/* Support Info */}
                <div className="text-center mt-8">
                    <p className="text-gray-400 text-sm">
                        Cần hỗ trợ? Liên hệ: <span className="text-purple-400">support@agricarbon.vn</span> hoặc <span className="text-purple-400">1900-xxxx</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CompanyPayment;
