import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { userAPI, cropAPI } from '../services/api';

const History = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [declarations, setDeclarations] = useState([]);
    const [selectedDeclaration, setSelectedDeclaration] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        checkAuthAndLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkAuthAndLoadData = async () => {
        try {
            const userInfo = await userAPI.getProfile();
            if (userInfo.role !== 'farmer') {
                navigate('/');
                return;
            }
            setUser(userInfo);
            
            const declarationsData = await cropAPI.getDeclarations();
            setDeclarations(declarationsData);
        } catch {
            navigate('/login');
        } finally {
            setLoading(false);
        }
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
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const canEdit = (declaration) => {
        return declaration.status === 'draft';
    };

    const canDelete = (declaration) => {
        return declaration.status === 'draft' || declaration.status === 'committed';
    };

    const handleViewDetail = (declaration) => {
        setSelectedDeclaration(declaration);
        setShowModal(true);
    };

    const handleEdit = (declaration) => {
        // Navigate to crop declaration page with edit mode
        navigate(`/crop-declaration?edit=${declaration.id}`);
    };

    const handleCommit = (declaration) => {
        // Navigate to crop declaration page with commit mode
        navigate(`/crop-declaration?commit=${declaration.id}`);
    };

    const handleSubmit = async (declarationId) => {
        try {
            await cropAPI.submitDeclaration(declarationId);
            alert('Nộp khai báo thành công! Đang chờ xác nhận từ admin.');
            // Reload to update status
            const declarations = await cropAPI.getDeclarations();
            setDeclarations(declarations);
        } catch (error) {
            alert('Có lỗi xảy ra khi nộp khai báo: ' + error.response?.data?.detail);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await cropAPI.deleteDeclaration(deleteId);
            alert('Xóa khai báo thành công');
            setShowDeleteModal(false);
            setDeleteId(null);
            checkAuthAndLoadData(); // Reload data
        } catch (error) {
            alert('Có lỗi xảy ra khi xóa: ' + error.response?.data?.detail);
        }
    };

    const filteredDeclarations = declarations.filter(declaration => {
        if (filter === 'all') return true;
        return declaration.status === filter;
    });

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
                <div className="mb-6 md:mb-8">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Lịch sử khai báo</h1>
                    <p className="text-gray-600 mt-1 text-sm md:text-base">Quản lý các khai báo cây trồng đã tạo</p>
                </div>

                {/* Filter Tabs - Mobile Responsive */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2 md:gap-4">
                        {[
                            { value: 'all', label: 'Tất cả' },
                            { value: 'draft', label: 'Nháp' },
                            { value: 'committed', label: 'Đã ký' },
                            { value: 'pending', label: 'Chờ duyệt' },
                            { value: 'approved', label: 'Đã duyệt' },
                            { value: 'rejected', label: 'Từ chối' }
                        ].map(status => (
                            <button
                                key={status.value}
                                onClick={() => setFilter(status.value)}
                                className={`px-4 py-3 md:px-5 md:py-3 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 shadow-lg ${
                                    filter === status.value
                                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-xl transform scale-105'
                                        : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-gray-50 hover:shadow-xl border border-gray-200 transform hover:scale-105'
                                }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards - Mobile Responsive */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-3 md:p-4">
                        <div className="text-center">
                            <div className="text-lg md:text-2xl font-bold text-indigo-600">
                                {declarations.length}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">Tổng số</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-3 md:p-4">
                        <div className="text-center">
                            <div className="text-lg md:text-2xl font-bold text-yellow-600">
                                {declarations.filter(d => d.status === 'pending').length}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">Chờ duyệt</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-3 md:p-4">
                        <div className="text-center">
                            <div className="text-lg md:text-2xl font-bold text-green-600">
                                {declarations.filter(d => d.status === 'approved').length}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">Đã duyệt</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-3 md:p-4">
                        <div className="text-center">
                            <div className="text-lg md:text-2xl font-bold text-red-600">
                                {declarations.filter(d => d.status === 'rejected').length}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">Từ chối</div>
                        </div>
                    </div>
                </div>

                {/* Declarations List */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30">
                    <div className="px-4 md:px-6 py-4 border-b border-gray-200">
                        <h3 className="text-base md:text-lg font-medium text-gray-900">
                            Danh sách khai báo ({filteredDeclarations.length})
                        </h3>
                    </div>
                    
                    {filteredDeclarations.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <div className="text-4xl md:text-6xl mb-4">📋</div>
                            <p className="text-sm md:text-base">Chưa có khai báo nào</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Khu vực & Cây trồng
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
                                        {filteredDeclarations.map((declaration) => (
                                            <tr key={declaration.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {declaration.area_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {declaration.crop_type}
                                                    </div>
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
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleViewDetail(declaration)}
                                                            className="text-amber-600 hover:text-amber-900 px-3 py-1 rounded-lg hover:bg-amber-50"
                                                        >
                                                            Xem
                                                        </button>
                                                        {canEdit(declaration) && (
                                                            <button
                                                                onClick={() => handleEdit(declaration)}
                                                                className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-lg hover:bg-blue-50"
                                                            >
                                                                Sửa
                                                            </button>
                                                        )}
                                                        {declaration.status === 'draft' && (
                                                            <button
                                                                onClick={() => handleCommit(declaration)}
                                                                className="text-green-600 hover:text-green-900 px-3 py-1 rounded-lg hover:bg-green-50"
                                                            >
                                                                Cam kết
                                                            </button>
                                                        )}
                                                        {declaration.status === 'committed' && (
                                                            <button
                                                                onClick={() => handleSubmit(declaration.id)}
                                                                className="text-purple-600 hover:text-purple-900 px-3 py-1 rounded-lg hover:bg-purple-50"
                                                            >
                                                                Xác nhận
                                                            </button>
                                                        )}
                                                        {canDelete(declaration) && (
                                                            <button
                                                                onClick={() => handleDeleteClick(declaration.id)}
                                                                className="text-red-600 hover:text-red-900 px-3 py-1 rounded-lg hover:bg-red-50"
                                                            >
                                                                Xóa
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden">
                                {filteredDeclarations.map((declaration) => (
                                    <div key={declaration.id} className="border-b border-gray-200 p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {declaration.area_name}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {declaration.crop_type} • {declaration.area_size} hecta
                                                </p>
                                            </div>
                                            {getStatusBadge(declaration.status)}
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-gray-500">
                                                {new Date(declaration.created_at).toLocaleDateString('vi-VN')}
                                            </p>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleViewDetail(declaration)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-900 font-medium"
                                                >
                                                    Xem
                                                </button>
                                                {canEdit(declaration) && (
                                                    <button
                                                        onClick={() => handleEdit(declaration)}
                                                        className="text-xs text-blue-600 hover:text-blue-900 font-medium"
                                                    >
                                                        Sửa
                                                    </button>
                                                )}
                                                {declaration.status === 'draft' && (
                                                    <button
                                                        onClick={() => handleCommit(declaration)}
                                                        className="text-xs text-green-600 hover:text-green-900 font-medium"
                                                    >
                                                        Cam kết
                                                    </button>
                                                )}
                                                {declaration.status === 'committed' && (
                                                    <button
                                                        onClick={() => handleSubmit(declaration.id)}
                                                        className="text-xs text-purple-600 hover:text-purple-900 font-medium"
                                                    >
                                                        Xác nhận
                                                    </button>
                                                )}
                                                {canDelete(declaration) && (
                                                    <button
                                                        onClick={() => handleDeleteClick(declaration.id)}
                                                        className="text-xs text-red-600 hover:text-red-900 font-medium"
                                                    >
                                                        Xóa
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {showModal && selectedDeclaration && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-base md:text-lg font-medium text-gray-900">Chi tiết khai báo</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4 md:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Basic Info */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900 text-sm md:text-base">Thông tin khai báo</h4>
                                    <div className="space-y-2 text-xs md:text-sm">
                                        <p><span className="font-medium">Khu vực:</span> {selectedDeclaration.area_name}</p>
                                        <p><span className="font-medium">Loại cây:</span> {selectedDeclaration.crop_type}</p>
                                        <p><span className="font-medium">Diện tích:</span> {selectedDeclaration.area_size} hecta</p>
                                        <p><span className="font-medium">Số năm trồng:</span> {selectedDeclaration.planting_years} năm</p>
                                        <p><span className="font-medium">GPS:</span> {selectedDeclaration.latitude}, {selectedDeclaration.longitude}</p>
                                        <p><span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedDeclaration.status)}</p>
                                    </div>
                                </div>

                                {/* Evidence Image */}
                                {selectedDeclaration.evidence_image_path && (
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900 text-sm md:text-base">Ảnh minh chứng</h4>
                                        <img 
                                            src={`http://localhost:8000/api/crop/files/${selectedDeclaration.evidence_image_path}`}
                                            alt="Ảnh minh chứng"
                                            className="w-full border border-gray-300 rounded cursor-pointer hover:opacity-80"
                                            onClick={() => window.open(`http://localhost:8000/api/crop/files/${selectedDeclaration.evidence_image_path}`, '_blank')}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Commitment Info */}
                            {selectedDeclaration.commitment && (
                                <div className="mt-4 md:mt-6 space-y-3">
                                    <h4 className="font-medium text-gray-900 text-sm md:text-base">Thông tin cam kết</h4>
                                    <div className="bg-gray-50 p-3 md:p-4 rounded-md">
                                        <p className="text-xs md:text-sm text-gray-700 mb-3">{selectedDeclaration.commitment.commitment_text}</p>
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                                            <p className="text-xs md:text-sm"><span className="font-medium">Người ký:</span> {selectedDeclaration.commitment.signer_name}</p>
                                            <p className="text-xs md:text-sm text-gray-500">
                                                Ký ngày: {new Date(selectedDeclaration.commitment.signed_at).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        {selectedDeclaration.commitment.signature_data && (
                                            <div className="mt-3">
                                                <p className="text-xs md:text-sm font-medium mb-2">Chữ ký:</p>
                                                <img 
                                                    src={selectedDeclaration.commitment.signature_data}
                                                    alt="Chữ ký"
                                                    className="border border-gray-300 rounded max-w-full md:max-w-xs"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-4 md:p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <svg className="w-4 h-4 md:w-5 md:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm md:text-base font-medium text-gray-900">Xác nhận xóa</h3>
                                    <p className="text-xs md:text-sm text-gray-500 mt-1">Bạn có chắc chắn muốn xóa khai báo này?</p>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default History;