import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CompanyPayment = () => {
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [hasReadTerms, setHasReadTerms] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [hasReadTermsPreviously, setHasReadTermsPreviously] = useState(false);

    const commitments = [
        "Cam kết tuân thủ các tiêu chuẩn quốc tế về carbon credit (Verra, Gold Standard)",
        "Thực hiện đúng quy trình đánh giá và giám sát dự án theo quy định",
        "Cung cấp thông tin chính xác và minh bạch về hoạt động của tổ chức",
        "Hỗ trợ phát triển bền vững các dự án carbon tại Việt Nam",
        "Tuân thủ các quy định pháp luật về môi trường và khí hậu"
    ];

    const allTerms = [
        // Phần 1: Điều khoản cam kết dịch vụ
        {
            section: "Điều khoản cam kết dịch vụ",
            items: [
                {
                    title: "Cam kết tuân thủ tiêu chuẩn quốc tế",
                    content: "Cam kết tuân thủ các tiêu chuẩn quốc tế về carbon credit (Verra, Gold Standard) và các quy định về chất lượng dịch vụ. Đảm bảo mọi hoạt động đều được thực hiện theo đúng các chuẩn mực được quốc tế công nhận."
                },
                {
                    title: "Quy trình đánh giá và giám sát",
                    content: "Thực hiện đúng quy trình đánh giá và giám sát dự án theo quy định. Tuân thủ các bước kiểm tra, đánh giá chất lượng và báo cáo định kỳ để đảm bảo hiệu quả dự án."
                },
                {
                    title: "Minh bạch thông tin",
                    content: "Cung cấp thông tin chính xác và minh bạch về hoạt động của tổ chức. Cam kết công khai các báo cáo, kết quả đánh giá và tiến độ thực hiện dự án một cách trung thực."
                },
                {
                    title: "Phát triển bền vững",
                    content: "Hỗ trợ phát triển bền vững các dự án carbon tại Việt Nam. Đóng góp tích cực vào mục tiêu giảm phát thải khí nhà kính và bảo vệ môi trường của quốc gia."
                },
                {
                    title: "Tuân thủ pháp luật môi trường",
                    content: "Tuân thủ các quy định pháp luật về môi trường và khí hậu. Đảm bảo mọi hoạt động đều phù hợp với luật pháp Việt Nam và các cam kết quốc tế về biến đổi khí hậu."
                }
            ]
        },
        // Phần 2: Điều khoản thanh toán
        {
            section: "Điều khoản thanh toán",
            items: [
                {
                    title: "Xác nhận thông tin thanh toán",
                    content: "Khách hàng cam kết đã kiểm tra đúng số tiền, nội dung chuyển khoản và thông tin người nhận trước khi thực hiện thanh toán qua mã QR. Mọi sai sót do không kiểm tra kỹ thông tin sẽ do khách hàng chịu trách nhiệm."
                },
                {
                    title: "Không hoàn/hủy sau khi thanh toán",
                    content: "Do đặc thù giao dịch điện tử, mọi khoản thanh toán sẽ không được hoàn hoặc hủy sau khi đã chuyển khoản thành công, trừ khi có thỏa thuận khác bằng văn bản. Khách hàng cần cân nhắc kỹ trước khi thực hiện giao dịch."
                },
                {
                    title: "Bảo mật thông tin thanh toán", 
                    content: "Khách hàng cam kết không chia sẻ mã QR thanh toán cho bất kỳ người nào khác để tránh bị lợi dụng hoặc phát sinh giao dịch ngoài ý muốn. Mọi thiệt hại do chia sẻ thông tin thanh toán sẽ do khách hàng chịu trách nhiệm."
                },
                {
                    title: "Xử lý sự cố kỹ thuật",
                    content: "Nếu xảy ra lỗi kỹ thuật hoặc giao dịch treo, khách hàng cần liên hệ ngay với bộ phận hỗ trợ trong vòng 24 giờ và cung cấp đầy đủ chứng từ chuyển khoản (screenshot, biên lai) để được xử lý kịp thời."
                },
                {
                    title: "Tuân thủ pháp luật",
                    content: "Khách hàng cam kết việc thanh toán không phục vụ cho các hoạt động vi phạm pháp luật, rửa tiền, gian lận tài chính hay bất kỳ hành vi bất hợp pháp nào khác. Công ty có quyền từ chối dịch vụ nếu phát hiện vi phạm."
                },
                {
                    title: "Hoàn tất giao dịch",
                    content: "Thanh toán chỉ được coi là hoàn tất khi hệ thống xác nhận đã nhận đủ số tiền theo đơn hàng. Thời gian xử lý giao dịch có thể từ 1-3 ngày làm việc tùy thuộc vào ngân hàng. Khách hàng cần kiên nhẫn chờ đợi."
                },
                {
                    title: "Quyền và nghĩa vụ của khách hàng",
                    content: "Khách hàng có quyền yêu cầu hóa đơn VAT, thông tin chi tiết về dịch vụ và hỗ trợ kỹ thuật. Đồng thời có nghĩa vụ cung cấp thông tin chính xác, tuân thủ quy định sử dụng dịch vụ và thanh toán đầy đủ theo cam kết."
                },
                {
                    title: "Điều khoản hiệu lực",
                    content: "Các điều khoản này có hiệu lực ngay khi khách hàng thực hiện thanh toán và được áp dụng trong suốt thời gian sử dụng dịch vụ. Mọi thay đổi sẽ được thông báo trước ít nhất 15 ngày."
                }
            ]
        }
    ];

    // Handle scroll tracking trong modal
    const handleScroll = (e) => {
        const element = e.target;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        
        const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollProgress(Math.min(Math.max(scrolled, 0), 100));
        
        // Cho phép tick khi scroll đến 90% cuối trang
        if (scrolled >= 90) {
            setHasReadTerms(true);
        }
    };

    const openTermsModal = () => {
        setShowTermsModal(true);
        setScrollProgress(0);
        setHasReadTerms(hasReadTermsPreviously); // Nếu đã đọc trước đó thì giữ state
    };

    const closeTermsModal = () => {
        // Cho phép đóng nếu đã đọc hết hoặc đã đọc trước đó
        if (hasReadTerms || hasReadTermsPreviously) {
            setShowTermsModal(false);
        } else {
            alert('Vui lòng đọc hết các điều khoản trước khi đóng popup!');
        }
    };

    const cancelTermsModal = () => {
        // Luôn cho phép hủy
        setShowTermsModal(false);
        // Reset lại state nếu người dùng chưa đồng ý từ trước
        if (!hasReadTermsPreviously) {
            setHasReadTerms(false);
            setScrollProgress(0);
        }
    };

    const handleAgreeTerms = () => {
        if (hasReadTerms) {
            setAgreed(true);
            setHasReadTermsPreviously(true); // Đánh dấu đã đọc hết trước đó
            setShowTermsModal(false);
        } else {
            alert('Vui lòng đọc hết các điều khoản trước khi đồng ý!');
        }
    };

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

                    {/* Terms & Commitments Section */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl" style={{
                        boxShadow: '0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}>
                        <h2 className="text-2xl font-bold text-white mb-6">Điều khoản và cam kết</h2>
                        
                        <div className="bg-white/5 rounded-lg p-6 mb-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-white font-semibold text-lg">Điều khoản toàn diện</h3>
                            </div>
                            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                                Để hoàn tất đăng ký, bạn cần đọc và đồng ý với đầy đủ các điều khoản gồm:
                            </p>
                            <ul className="text-gray-300 text-sm space-y-2 mb-4 ml-4">
                                <li className="flex items-center space-x-2">
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                                    <span>Điều khoản cam kết dịch vụ (5 điều khoản)</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                                    <span>Điều khoản thanh toán (8 điều khoản)</span>
                                </li>
                            </ul>
                            <button
                                type="button"
                                onClick={openTermsModal}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                📄 Đọc toàn bộ điều khoản chi tiết
                            </button>
                        </div>

                        {/* Agreement Section */}
                        <div className="mb-6">
                            <label className="flex items-start space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => {
                                        if (e.target.checked && !hasReadTermsPreviously) {
                                            // Nếu chưa đọc điều khoản, mở popup
                                            openTermsModal();
                                        } else {
                                            // Cho phép bỏ tick hoặc tick lại nếu đã đọc trước đó
                                            setAgreed(e.target.checked);
                                        }
                                    }}
                                    disabled={false}
                                    className="w-5 h-5 text-purple-600 bg-white/90 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mt-0.5"
                                />
                                <span className="text-gray-200 text-sm">
                                    Tôi đã đọc, hiểu và đồng ý tuân thủ tất cả các điều khoản cam kết dịch vụ và điều khoản thanh toán. Tôi cam kết sử dụng dịch vụ một cách có trách nhiệm và tuân thủ đầy đủ các quy định.
                                    {!agreed && (
                                        <span className="block text-yellow-400 text-xs mt-1">
                                            * Vui lòng đọc toàn bộ điều khoản để có thể tick đồng ý
                                        </span>
                                    )}
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

            {/* Terms Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col" 
                         style={{
                             boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                         }}>
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Điều khoản và cam kết chi tiết</h2>
                                    <p className="text-purple-100 text-sm mt-1">Điều khoản cam kết dịch vụ và điều khoản thanh toán toàn diện</p>
                                </div>
                                <button
                                    onClick={closeTermsModal}
                                    className="text-white hover:text-purple-200 transition-colors duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-purple-100">Tiến độ đọc</span>
                                    <span className="text-sm text-purple-100">{Math.round(scrollProgress)}%</span>
                                </div>
                                <div className="w-full bg-purple-800/30 rounded-full h-2">
                                    <div 
                                        className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${scrollProgress}%` }}
                                    ></div>
                                </div>
                                {scrollProgress < 90 && !hasReadTermsPreviously && (
                                    <p className="text-xs text-purple-100 mt-1">
                                        📖 Bạn cần đọc đến ít nhất 90% nội dung để có thể đồng ý điều khoản
                                    </p>
                                )}
                                {hasReadTermsPreviously && (
                                    <p className="text-xs text-green-200 mt-1">
                                        ✅ Bạn đã đọc và đồng ý các điều khoản này trước đó
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div 
                            className="flex-1 overflow-y-auto p-6 space-y-8"
                            onScroll={handleScroll}
                        >
                            {allTerms.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="space-y-4">
                                    {/* Section Header */}
                                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border border-purple-200">
                                        <h2 className="text-lg font-bold text-purple-800 flex items-center">
                                            <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm mr-3">
                                                {sectionIndex + 1}
                                            </span>
                                            {section.section}
                                        </h2>
                                    </div>
                                    
                                    {/* Section Items */}
                                    <div className="space-y-3 ml-4">
                                        {section.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <span className="text-purple-600 font-bold text-xs">
                                                            {sectionIndex + 1}.{itemIndex + 1}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                                                        <p className="text-gray-700 leading-relaxed text-sm">{item.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            
                            {/* Important Notice */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-red-900 mb-2">⚠️ Lưu ý quan trọng</h3>
                                        <p className="text-red-800 text-sm leading-relaxed">
                                            Bằng cách đồng ý với các điều khoản này, bạn xác nhận đã hiểu rõ và chấp nhận tất cả các quy định về thanh toán. 
                                            Mọi giao dịch đều có tính chất pháp lý và bạn có trách nhiệm tuân thủ đầy đủ.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    {hasReadTermsPreviously ? (
                                        <span className="text-green-600 font-medium">✅ Đã đồng ý trước đó</span>
                                    ) : hasReadTerms ? (
                                        <span className="text-green-600 font-medium">✅ Bạn đã đọc đủ nội dung</span>
                                    ) : (
                                        <span>📖 Vui lòng đọc hết nội dung để tiếp tục</span>
                                    )}
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={cancelTermsModal}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 border border-gray-300 rounded-lg hover:bg-gray-100"
                                    >
                                        Hủy
                                    </button>
                                    {hasReadTermsPreviously ? (
                                        <button
                                            onClick={closeTermsModal}
                                            className="px-6 py-2 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            📄 Đóng
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleAgreeTerms}
                                            disabled={!hasReadTerms}
                                            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                                                hasReadTerms 
                                                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl' 
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            ✅ Đồng ý các điều khoản
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyPayment;
