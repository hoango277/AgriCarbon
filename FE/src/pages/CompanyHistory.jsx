import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import axiosInstance from '../config/axios';

const CompanyHistory = () => {
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [paymentStats, setPaymentStats] = useState({
        total_payments: 0,
        consecutive_payments: 0,
        next_bonus_in: 0,
        has_active_subscription: false
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        has_next: false,
        has_prev: false
    });
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [extendLoading, setExtendLoading] = useState(false);

    const loadPaymentHistory = async (page = 1) => {
        try {
            console.log('Company token:', localStorage.getItem('company_token'));
            console.log('Loading payment history page:', page);
            const response = await axiosInstance.get(`/company/payment-history?page=${page}&limit=5`);
            setPaymentHistory(response.payment_history);
            setPaymentStats({
                total_payments: response.total_payments,
                consecutive_payments: response.consecutive_payments,
                next_bonus_in: response.next_bonus_in,
                has_active_subscription: response.has_active_subscription
            });
            setPagination({
                current_page: response.current_page,
                total_pages: response.total_pages,
                has_next: response.has_next,
                has_prev: response.has_prev
            });
        } catch (error) {
            console.error('Error loading payment history:', error);
        }
    };

    const loadSubscriptionStatus = async () => {
        try {
            const response = await axiosInstance.get('/company/subscription-status');
            setTimeLeft({
                days: response.days_remaining || 0,
                hours: response.hours_remaining || 0,
                minutes: response.minutes_remaining || 0,
                seconds: response.seconds_remaining || 0
            });
        } catch (error) {
            console.error('Error loading subscription status:', error);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('company_token');
            const companyData = localStorage.getItem('company_data');
            const paymentCompleted = localStorage.getItem('company_payment_completed');

            if (!token || !paymentCompleted) {
                navigate('/company-login');
                return;
            }

            if (companyData) {
                const companyUser = {
                    ...JSON.parse(companyData),
                    role: 'company',
                    full_name: JSON.parse(companyData).organization_name
                };
                setCompany(companyUser);
            }
            
            // Load data
            await Promise.all([
                loadPaymentHistory(),
                loadSubscriptionStatus()
            ]);
            
            setLoading(false);
        };

        checkAuth();
    }, [navigate]);

    // Countdown timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else if (prev.days > 0) {
                    return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleExtendSubscription = async () => {
        if (extendLoading) return;
        
        setExtendLoading(true);
        try {
            const response = await axiosInstance.post('/company/extend-subscription', {
                payment_method: 'bank_transfer',
                months: 1
            });
            
            if (response.success) {
                alert(response.message);
                // Reload data
                await Promise.all([
                    loadPaymentHistory(),
                    loadSubscriptionStatus()
                ]);
            }
        } catch (error) {
            alert('Có lỗi xảy ra khi gia hạn: ' + (error.message || 'Vui lòng thử lại'));
        } finally {
            setExtendLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'active':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'Hoàn thành';
            case 'active':
                return 'Đang sử dụng';
            case 'pending':
                return 'Đang xử lý';
            default:
                return 'Không xác định';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <Layout user={company}>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Lịch sử thanh toán</h1>
                    <p className="text-gray-600 mt-1">Quản lý và theo dõi các gói dịch vụ của bạn</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Subscription Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Current Subscription Status */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Gói dịch vụ hiện tại</h2>
                                    <p className="text-gray-600">Theo dõi thời gian sử dụng và gia hạn</p>
                                </div>
                                <div className="mt-4 sm:mt-0">
                                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                        Đang hoạt động
                                    </span>
                                </div>
                            </div>

                            {/* Countdown Timer */}
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                                <div className="flex flex-col sm:flex-row items-center justify-between">
                                    <div className="mb-4 sm:mb-0">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Thời gian còn lại</h3>
                                        <p className="text-gray-600 text-sm">Đến ngược kể từ thời điểm thanh toán thành công</p>
                                    </div>
                                    <div className="flex space-x-2 text-center">
                                        <div className="bg-white rounded-lg px-3 py-2 shadow-md border border-green-200">
                                            <div className="text-2xl font-bold text-green-600">{timeLeft.days}</div>
                                            <div className="text-xs text-gray-500">ngày</div>
                                        </div>
                                        <div className="bg-white rounded-lg px-3 py-2 shadow-md border border-green-200">
                                            <div className="text-2xl font-bold text-green-600">{timeLeft.hours}</div>
                                            <div className="text-xs text-gray-500">giờ</div>
                                        </div>
                                        <div className="bg-white rounded-lg px-3 py-2 shadow-md border border-green-200">
                                            <div className="text-2xl font-bold text-green-600">{timeLeft.minutes}</div>
                                            <div className="text-xs text-gray-500">phút</div>
                                        </div>
                                        <div className="bg-white rounded-lg px-3 py-2 shadow-md border border-green-200">
                                            <div className="text-2xl font-bold text-green-600">{timeLeft.seconds}</div>
                                            <div className="text-xs text-gray-500">giây</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Extend Button */}
                            <button
                                onClick={handleExtendSubscription}
                                disabled={extendLoading}
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
                            >
                                {extendLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                )}
                                <span>{extendLoading ? 'Đang xử lý...' : 'Gia hạn thêm'}</span>
                            </button>
                        </div>

                        {/* Payment History */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Lịch sử thanh toán</h3>
                            
                            <div className="space-y-4">
                                {paymentHistory.map((payment) => (
                                    <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                                        <div className="flex-1 mb-3 sm:mb-0">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h4 className="font-semibold text-gray-900">{payment.period_name}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                    {getStatusText(payment.status)}
                                                </span>
                                                {payment.is_bonus && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        BONUS
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 text-sm">
                                                {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 'Chưa thanh toán'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">
                                                {payment.amount === 0 ? 'MIỄN PHÍ' : formatCurrency(payment.amount)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.total_pages > 1 && (
                                <div className="flex justify-center items-center space-x-4 mt-6">
                                    <button
                                        onClick={() => loadPaymentHistory(pagination.current_page - 1)}
                                        disabled={!pagination.has_prev}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors duration-200"
                                    >
                                        Trước
                                    </button>
                                    
                                    <div className="flex space-x-2">
                                        {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => loadPaymentHistory(page)}
                                                className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                                                    page === pagination.current_page
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => loadPaymentHistory(pagination.current_page + 1)}
                                        disabled={!pagination.has_next}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors duration-200"
                                    >
                                        Tiếp
                                    </button>
                                </div>
                            )}

                            {/* Empty State */}
                            {paymentHistory.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500">Chưa có lịch sử thanh toán nào</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Bonus Info */}
                    <div className="space-y-6">
                        {/* Bonus Tracker */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 shadow-xl">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">BONUS</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Với mỗi 5 lần gia hạn liên tiếp, bạn sẽ được thêm 1 tháng miễn phí!
                                </p>
                            </div>

                            {/* Progress */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Tiến độ</span>
                                    <span className="text-sm font-medium text-purple-600">
                                        {paymentStats.consecutive_payments}/5
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${(paymentStats.consecutive_payments / 5) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Next Free Info */}
                            <div className="text-center">
                                {paymentStats.next_bonus_in === 0 ? (
                                    <div className="bg-white rounded-xl p-4 border border-purple-200">
                                        <p className="text-purple-600 font-semibold mb-1">🎉 Chúc mừng!</p>
                                        <p className="text-gray-700 text-sm">Bạn đã nhận được tháng miễn phí</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl p-4 border border-purple-200">
                                        <p className="text-gray-700 text-sm">
                                            Còn <span className="font-bold text-purple-600">{paymentStats.next_bonus_in}</span> lần gia hạn nữa để nhận tháng miễn phí
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Support */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Hỗ trợ</h4>
                                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm">
                                    Liên hệ hỗ trợ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CompanyHistory;
