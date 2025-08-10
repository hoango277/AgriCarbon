import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const CompanyDashboard = () => {
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sample history data
    const [historyData] = useState([
        {
            id: 1,
            date: '2024-01-15',
            action: 'Đăng ký tài khoản',
            description: 'Hoàn tất đăng ký và thanh toán phí dịch vụ',
            status: 'completed'
        },
        {
            id: 2,
            date: '2024-01-16', 
            action: 'Truy cập hệ thống',
            description: 'Đăng nhập và khám phá các tính năng của platform',
            status: 'completed'
        },
        {
            id: 3,
            date: '2024-01-18',
            action: 'Xem báo cáo thị trường',
            description: 'Truy cập báo cáo phân tích thị trường carbon credit Q1/2024',
            status: 'completed'
        },
        {
            id: 4,
            date: '2024-01-20',
            action: 'Liên hệ hỗ trợ',
            description: 'Yêu cầu tư vấn về quy trình đầu tư carbon credit',
            status: 'pending'
        }
    ]);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('company_token');
            const companyData = localStorage.getItem('company_data');
            const paymentCompleted = localStorage.getItem('company_payment_completed');

            if (!token || !paymentCompleted) {
                navigate('/company-login');
                return;
            }

            if (companyData) {
                // Create user object compatible with Layout component
                const companyUser = {
                    ...JSON.parse(companyData),
                    role: 'company',
                    full_name: JSON.parse(companyData).organization_name
                };
                setCompany(companyUser);
            }
            setLoading(false);
        };

        checkAuth();
    }, [navigate]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
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
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Chào mừng đến với AGRICARBON! 🌿
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">
                        Cảm ơn <strong>{company?.organization_name}</strong> đã tham gia hệ sinh thái carbon credit. 
                        Dưới đây là lịch sử hoạt động của tài khoản.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{historyData.length}</p>
                                <p className="text-gray-600 text-sm">Hoạt động</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">Đã thanh toán</p>
                                <p className="text-gray-600 text-sm">Trạng thái tài khoản</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">Hoạt động</p>
                                <p className="text-gray-600 text-sm">Trạng thái hoạt động</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử hoạt động</h3>
                    
                    <div className="space-y-4">
                        {historyData.map((item) => (
                            <div key={item.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:bg-gray-100 transition-all duration-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="text-lg font-semibold text-gray-900">{item.action}</h4>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {getStatusText(item.status)}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-2">{item.description}</p>
                                        <p className="text-gray-500 text-sm">
                                            {new Date(item.date).toLocaleDateString('vi-VN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State (if no data) */}
                    {historyData.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-500">Chưa có hoạt động nào được ghi nhận</p>
                        </div>
                    )}
                </div>

                {/* Support Section */}
                <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900">Cần hỗ trợ?</h4>
                            <p className="text-gray-600">
                                Liên hệ đội ngũ hỗ trợ 24/7: 
                                <a href="mailto:support@agricarbon.vn" className="text-purple-600 hover:text-purple-800 ml-1">
                                    support@agricarbon.vn
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CompanyDashboard;