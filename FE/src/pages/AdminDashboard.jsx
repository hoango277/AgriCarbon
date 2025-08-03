import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { userAPI, cropAPI } from '../services/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [declarations, setDeclarations] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('pending');
    const [selectedDeclaration, setSelectedDeclaration] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const checkAuthAndLoadData = useCallback(async () => {
        try {
            const userInfo = await userAPI.getProfile();
            if (userInfo.role !== 'admin') {
                navigate('/');
                return;
            }
            setUser(userInfo);
        } catch {
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const loadDeclarations = useCallback(async () => {
        try {
            const data = await cropAPI.getAllDeclarations(selectedStatus);
            setDeclarations(data);
        } catch (error) {
            console.error('Error loading declarations:', error);
        }
    }, [selectedStatus]);

    useEffect(() => {
        checkAuthAndLoadData();
    }, [checkAuthAndLoadData]);

    useEffect(() => {
        if (user) {
            loadDeclarations();
        }
    }, [user, loadDeclarations]);

    const handleApprove = async (declarationId, status, reason = '') => {
        try {
            await cropAPI.approveDeclaration(declarationId, { status, reason });
            alert(`Đã ${status === 'approved' ? 'phê duyệt' : 'từ chối'} khai báo thành công`);
            setShowModal(false);
            setSelectedDeclaration(null);
            loadDeclarations();
        } catch (error) {
            alert('Có lỗi xảy ra: ' + error.response?.data?.detail);
        }
    };

    const openModal = (declaration) => {
        setSelectedDeclaration(declaration);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDeclaration(null);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'draft': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Nháp' },
            'committed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã ký' },
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
            'approved': { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
            'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối' }
        };

        const config = statusConfig[status] || statusConfig['draft'];
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <Layout user={user}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý khai báo</h1>
                    <p className="text-gray-600 mt-1">Quản lý và xác nhận khai báo cây trồng</p>
                </div>

                {/* Status Filter */}
                <div className="mb-6">
                    <div className="flex space-x-4">
                        {[
                            { value: 'all', label: 'Tất cả' },
                            { value: 'pending', label: 'Chờ duyệt' },
                            { value: 'approved', label: 'Đã duyệt' },
                            { value: 'rejected', label: 'Từ chối' }
                        ].map(status => (
                            <button
                                key={status.value}
                                onClick={() => setSelectedStatus(status.value === 'all' ? null : status.value)}
                                className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${
                                    (selectedStatus === status.value || (selectedStatus === null && status.value === 'all'))
                                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-xl transform scale-105'
                                        : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-gray-50 hover:shadow-xl border border-gray-200 transform hover:scale-105'
                                }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Declarations List */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Danh sách khai báo ({declarations.length})
                        </h3>
                    </div>
                    
                    {declarations.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            Không có khai báo nào
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card Layout */}
                            <div className="block lg:hidden">
                                <div className="space-y-4 p-4">
                                    {declarations.map((declaration) => (
                                        <div key={declaration.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
                                            {/* Header: Farmer name and status */}
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 truncate">
                                                        {declaration.user?.full_name || 'N/A'}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {declaration.user?.phone_number || 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="ml-3 flex-shrink-0">
                                                    {getStatusBadge(declaration.status)}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">Khu vực:</span>
                                                    <p className="text-gray-900 mt-1 break-words">{declaration.area_name}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Cây trồng:</span>
                                                    <p className="text-gray-900 mt-1">{declaration.crop_type}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Diện tích:</span>
                                                    <p className="text-gray-900 mt-1">{declaration.area_size} hecta</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Ngày tạo:</span>
                                                    <p className="text-gray-900 mt-1">{new Date(declaration.created_at).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                                <button
                                                    onClick={() => openModal(declaration)}
                                                    className="flex-1 min-w-0 text-center bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Chi tiết
                                                </button>
                                                {declaration.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(declaration.id, 'approved')}
                                                            className="flex-1 min-w-0 text-center bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => handleApprove(declaration.id, 'rejected')}
                                                            className="flex-1 min-w-0 text-center bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Desktop Table Layout */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Nông dân
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Khu vực
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cây trồng
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Diện tích
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Trạng thái
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ngày tạo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {declarations.map((declaration) => (
                                            <tr key={declaration.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {declaration.user?.full_name || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {declaration.user?.phone_number || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                                    <div className="truncate" title={declaration.area_name}>
                                                        {declaration.area_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {declaration.crop_type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {declaration.area_size} hecta
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(declaration.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(declaration.created_at).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex flex-col xl:flex-row xl:space-x-2 space-y-1 xl:space-y-0">
                                                        <button
                                                            onClick={() => openModal(declaration)}
                                                            className="text-amber-600 hover:text-amber-900 px-2 py-1 rounded-lg hover:bg-amber-50 text-xs xl:text-sm"
                                                        >
                                                            Chi tiết
                                                        </button>
                                                        {declaration.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(declaration.id, 'approved')}
                                                                    className="text-green-600 hover:text-green-900 px-2 py-1 rounded-lg hover:bg-green-50 text-xs xl:text-sm"
                                                                >
                                                                    Duyệt
                                                                </button>
                                                                <button
                                                                    onClick={() => handleApprove(declaration.id, 'rejected')}
                                                                    className="text-red-600 hover:text-red-900 px-2 py-1 rounded-lg hover:bg-red-50 text-xs xl:text-sm"
                                                                >
                                                                    Từ chối
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal for Declaration Details */}
            {showModal && selectedDeclaration && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-white/30">
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900">Chi tiết khai báo</h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {/* Declaration Info */}
                                <div className="space-y-3 sm:space-y-4">
                                    <h4 className="font-medium text-gray-900 text-base sm:text-lg">Thông tin khai báo</h4>
                                    <div className="space-y-2 text-sm">
                                        <p className="break-words"><span className="font-medium">Khu vực:</span> {selectedDeclaration.area_name}</p>
                                        <p><span className="font-medium">Loại cây:</span> {selectedDeclaration.crop_type}</p>
                                        <p><span className="font-medium">Diện tích:</span> {selectedDeclaration.area_size} hecta</p>
                                        <p><span className="font-medium">Số năm trồng:</span> {selectedDeclaration.planting_years} năm</p>
                                        <p className="break-all"><span className="font-medium">GPS:</span> {selectedDeclaration.latitude}, {selectedDeclaration.longitude}</p>
                                        <p><span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedDeclaration.status)}</p>
                                    </div>
                                    
                                    {/* Evidence Image */}
                                    {selectedDeclaration.evidence_image_path && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium mb-2">Ảnh minh chứng:</p>
                                            <img 
                                                src={`http://localhost:8000/api/crop/files/${selectedDeclaration.evidence_image_path}`}
                                                alt="Ảnh minh chứng"
                                                className="border border-gray-300 rounded w-full max-w-sm cursor-pointer hover:opacity-80"
                                                onClick={() => window.open(`http://localhost:8000/api/crop/files/${selectedDeclaration.evidence_image_path}`, '_blank')}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Farmer Info */}
                                <div className="space-y-3 sm:space-y-4">
                                    <h4 className="font-medium text-gray-900 text-base sm:text-lg">Thông tin nông dân</h4>
                                    <div className="space-y-2 text-sm">
                                        <p className="break-words"><span className="font-medium">Họ tên:</span> {selectedDeclaration.user?.full_name}</p>
                                        <p><span className="font-medium">CCCD:</span> {selectedDeclaration.user?.cccd}</p>
                                        <p><span className="font-medium">SĐT:</span> {selectedDeclaration.user?.phone_number}</p>
                                        <p className="break-words"><span className="font-medium">Địa chỉ:</span> {selectedDeclaration.user?.current_address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Commitment Info */}
                            {selectedDeclaration.commitment && (
                                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                                    <h4 className="font-medium text-gray-900 text-base sm:text-lg">Thông tin cam kết</h4>
                                    <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
                                        <p className="text-sm text-gray-700 mb-3">{selectedDeclaration.commitment.commitment_text}</p>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                            <p className="text-sm break-words"><span className="font-medium">Người ký:</span> {selectedDeclaration.commitment.signer_name}</p>
                                            <p className="text-sm text-gray-500">
                                                Ký ngày: {new Date(selectedDeclaration.commitment.signed_at).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        {/* Display signature */}
                                        {selectedDeclaration.commitment.signature_data && (
                                            <div className="mt-3">
                                                <p className="text-sm font-medium mb-2">Chữ ký:</p>
                                                <img 
                                                    src={selectedDeclaration.commitment.signature_data}
                                                    alt="Chữ ký"
                                                    className="border border-gray-300 rounded w-full max-w-xs"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {selectedDeclaration.status === 'pending' && (
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        onClick={() => handleApprove(selectedDeclaration.id, 'rejected')}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        Từ chối
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedDeclaration.id, 'approved')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Phê duyệt
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminDashboard;