import { useState, useEffect } from 'react';
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

    useEffect(() => {
        checkAuthAndLoadData();
    }, []);

    useEffect(() => {
        if (user) {
            loadDeclarations();
        }
    }, [selectedStatus, user]);

    const checkAuthAndLoadData = async () => {
        try {
            const userInfo = await userAPI.getProfile();
            if (userInfo.role !== 'admin') {
                navigate('/');
                return;
            }
            setUser(userInfo);
        } catch (error) {
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const loadDeclarations = async () => {
        try {
            const data = await cropAPI.getAllDeclarations(selectedStatus);
            setDeclarations(data);
        } catch (error) {
            console.error('Error loading declarations:', error);
        }
    };

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
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    (selectedStatus === status.value || (selectedStatus === null && status.value === 'all'))
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Declarations List */}
                <div className="bg-white rounded-lg shadow border border-gray-200">
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
                        <div className="overflow-x-auto">
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {declaration.area_name}
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
                                                <button
                                                    onClick={() => openModal(declaration)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    Xem chi tiết
                                                </button>
                                                {declaration.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(declaration.id, 'approved')}
                                                            className="text-green-600 hover:text-green-900 mr-3"
                                                        >
                                                            Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => handleApprove(declaration.id, 'rejected')}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Declaration Details */}
            {showModal && selectedDeclaration && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Chi tiết khai báo</h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Declaration Info */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900 text-lg">Thông tin khai báo</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">Khu vực:</span> {selectedDeclaration.area_name}</p>
                                        <p><span className="font-medium">Loại cây:</span> {selectedDeclaration.crop_type}</p>
                                        <p><span className="font-medium">Diện tích:</span> {selectedDeclaration.area_size} hecta</p>
                                        <p><span className="font-medium">Số năm trồng:</span> {selectedDeclaration.planting_years} năm</p>
                                        <p><span className="font-medium">GPS:</span> {selectedDeclaration.latitude}, {selectedDeclaration.longitude}</p>
                                        <p><span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedDeclaration.status)}</p>
                                    </div>
                                    
                                    {/* Evidence Image */}
                                    {selectedDeclaration.evidence_image_path && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium mb-2">Ảnh minh chứng:</p>
                                            <img 
                                                src={`http://localhost:8000/api/crop/files/${selectedDeclaration.evidence_image_path}`}
                                                alt="Ảnh minh chứng"
                                                className="border border-gray-300 rounded max-w-sm cursor-pointer hover:opacity-80"
                                                onClick={() => window.open(`http://localhost:8000/api/crop/files/${selectedDeclaration.evidence_image_path}`, '_blank')}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Farmer Info */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900 text-lg">Thông tin nông dân</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">Họ tên:</span> {selectedDeclaration.user?.full_name}</p>
                                        <p><span className="font-medium">CCCD:</span> {selectedDeclaration.user?.cccd}</p>
                                        <p><span className="font-medium">SĐT:</span> {selectedDeclaration.user?.phone_number}</p>
                                        <p><span className="font-medium">Địa chỉ:</span> {selectedDeclaration.user?.current_address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Commitment Info */}
                            {selectedDeclaration.commitment && (
                                <div className="mt-6 space-y-4">
                                    <h4 className="font-medium text-gray-900 text-lg">Thông tin cam kết</h4>
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm text-gray-700 mb-3">{selectedDeclaration.commitment.commitment_text}</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm"><span className="font-medium">Người ký:</span> {selectedDeclaration.commitment.signer_name}</p>
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
                                                    className="border border-gray-300 rounded max-w-xs"
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