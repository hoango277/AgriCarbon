import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import axiosInstance from '../config/axios';
import { promotionAPI } from '../services/api';

const CompanyHistory = () => {
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [promotionRegistrations, setPromotionRegistrations] = useState([]);
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

    const loadPromotionRegistrations = async () => {
        try {
            console.log('Loading promotion registrations...');
            const response = await promotionAPI.getAllRegistrations();
            console.log('Promotion registrations response:', response);
            
            // Handle different response structures
            if (response) {
                if (response.registrations && Array.isArray(response.registrations)) {
                    // Response has structure { registrations: [...], total: ..., page: ... }
                    setPromotionRegistrations(response.registrations);
                } else if (Array.isArray(response)) {
                    // Response is directly an array
                    setPromotionRegistrations(response);
                } else {
                    // Unknown structure
                    console.warn('Unknown response structure:', response);
                    setPromotionRegistrations([]);
                }
            } else {
                setPromotionRegistrations([]);
            }
        } catch (error) {
            console.error('Error loading promotion registrations:', error);
            // Set empty array if error (user might not have any registrations)
            setPromotionRegistrations([]);
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
                loadPromotionRegistrations()
            ]);
            
            setLoading(false);
        };

        checkAuth();
    }, [navigate]);

    const handleExtendSubscription = async () => {
        navigate('/promotion-register');
    };

    const handleExtendRegistration = (registration) => {
        // Save registration data to localStorage for pre-filling the form
        const extensionData = {
            company_name: registration.company_name,
            business_license: registration.business_license,
            address: registration.address,
            phone: registration.phone,
            email: registration.email,
            representative_name: registration.representative_name,
            representative_phone: registration.representative_phone,
            representative_email: registration.representative_email,
            project_name: registration.project_name,
            project_location: registration.project_location,
            project_area: registration.project_area,
            original_registration_id: registration.id
        };
        
        console.log('Saving extension data:', extensionData);
        console.log('Original registration object:', registration);
        localStorage.setItem('extend_registration_data', JSON.stringify(extensionData));
        
        // Verify data was saved
        const savedData = localStorage.getItem('extend_registration_data');
        console.log('Verified saved data:', savedData);
        
        // Navigate to promotion register page
        navigate('/promotion-register');
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
                <div className="grid grid-cols-1 gap-6">
                    {/* Left Column - Content */}
                    <div className="space-y-6">

                        {/* Promotion Registrations Section */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng ký ưu đãi đặc biệt</h3>
                                    <p className="text-gray-600">Quản lý các gói ưu đãi carbon tracking</p>
                                </div>
                                <button
                                    onClick={handleExtendSubscription}
                                    className="mt-4 sm:mt-0 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Đăng ký mới</span>
                                </button>
                            </div>
                            
                           
                            
                            <div className="space-y-4">
                                {promotionRegistrations.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đăng ký ưu đãi</h4>
                                        <p className="text-gray-500 mb-6">Hãy đăng ký gói ưu đãi đặc biệt để được hỗ trợ tốt nhất</p>
                                        <button
                                            onClick={handleExtendSubscription}
                                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 inline-flex items-center space-x-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span>Đăng ký ưu đãi đặc biệt</span>
                                        </button>
                                    </div>
                                ) : (
                                    promotionRegistrations.map((registration) => (
                                        <div key={registration.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                                <div className="flex-1 mb-4 lg:mb-0">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-bold text-gray-900">{registration.company_name}</h4>
                                                            <p className="text-sm text-gray-600">Mã giấy phép: {registration.business_license}</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-600"><span className="font-medium text-gray-900">Dự án:</span> {registration.project_name}</p>
                                                            <p className="text-gray-600"><span className="font-medium text-gray-900">Vị trí:</span> {registration.project_location}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600"><span className="font-medium text-gray-900">Diện tích:</span> {registration.project_area} ha</p>
                                                            <p className="text-gray-600"><span className="font-medium text-gray-900">Đăng ký:</span> {new Date(registration.created_at).toLocaleDateString('vi-VN')}</p>
                                                        </div>
                                                    </div>
                                                    {registration.project_description && (
                                                        <div className="mt-3">
                                                            <p className="text-gray-900 font-medium text-sm">
                                                                {registration.project_description} tháng
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-end xl:items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-0 lg:space-y-2 xl:space-y-0 xl:space-x-4">
                                                    <button
                                                        onClick={() => handleExtendRegistration(registration)}
                                                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 text-sm whitespace-nowrap"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                        <span>Gia hạn</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                       
                    </div>

                  
                </div>
            </div>
        </Layout>
    );
};

export default CompanyHistory;
