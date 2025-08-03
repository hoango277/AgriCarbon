import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import SignatureCanvas from '../components/SignatureCanvas';
import { userAPI, cropAPI } from '../services/api';

const CropDeclaration = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDeclaration, setSelectedDeclaration] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    
    // Form states
    const [declarationForm, setDeclarationForm] = useState({
        area_name: '',
        latitude: null,
        longitude: null,
        area_size: '',
        crop_type: '',
        planting_years: '',
        evidence_image: null
    });
    
    const [commitmentForm, setCommitmentForm] = useState({
        commitment_text: '',
        signature_data: '',
        signer_name: ''
    });

    useEffect(() => {
        initializePage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const initializePage = async () => {
        // First check auth and load user data
        const userData = await checkAuthAndLoadData();
        
        // Then check for edit or commit mode from URL params
        const editParam = searchParams.get('edit');
        const commitParam = searchParams.get('commit');
        
        if (editParam && userData) {
            setEditMode(true);
            setEditId(parseInt(editParam));
            loadDeclarationForEdit(parseInt(editParam));
        } else if (commitParam && userData) {
            setEditId(parseInt(commitParam));
            loadDeclarationForCommitWithUser(parseInt(commitParam), userData);
        }
    };

    const checkAuthAndLoadData = async () => {
        try {
            const userInfo = await userAPI.getProfile();
            if (userInfo.role !== 'farmer') {
                navigate('/');
                return null;
            }
            setUser(userInfo);
            setLoading(false);
            return userInfo;
        } catch {
            navigate('/login');
            setLoading(false);
            return null;
        }
    };

    const loadDeclarationForEdit = async (declarationId) => {
        try {
            const declaration = await cropAPI.getDeclaration(declarationId);
            
            // Load data into form
            setDeclarationForm({
                area_name: declaration.area_name,
                latitude: declaration.latitude,
                longitude: declaration.longitude,
                area_size: declaration.area_size,
                crop_type: declaration.crop_type,
                planting_years: declaration.planting_years,
                evidence_image: null // File won't be loaded, user can upload new one
            });
            
            setSelectedDeclaration(declaration);
            
            // Set appropriate step based on status
            if (declaration.status === 'draft') {
                setCurrentStep(1);
            } else if (declaration.status === 'committed') {
                setCurrentStep(2);
                // Load commitment data if exists
                if (declaration.commitment) {
                    setCommitmentForm({
                        commitment_text: declaration.commitment.commitment_text,
                        signature_data: declaration.commitment.signature_data,
                        signer_name: declaration.commitment.signer_name
                    });
                }
            }
        } catch (error) {
            alert('Không thể tải dữ liệu khai báo: ' + error.response?.data?.detail);
            navigate('/history');
        }
    };



    const loadDeclarationForCommitWithUser = async (declarationId, userData) => {
        try {
            const declaration = await cropAPI.getDeclaration(declarationId);
            
            if (declaration.status !== 'draft') {
                alert('Chỉ có thể ký cam kết cho khai báo ở trạng thái nháp');
                navigate('/history');
                return;
            }
            
            setSelectedDeclaration(declaration);
            setCurrentStep(2); // Go directly to commitment step
            
            // Load declaration data for display
            setDeclarationForm({
                area_name: declaration.area_name,
                latitude: declaration.latitude,
                longitude: declaration.longitude,
                area_size: declaration.area_size,
                crop_type: declaration.crop_type,
                planting_years: declaration.planting_years,
                evidence_image: null
            });
            
            // Pre-fill commitment form with user info
            setCommitmentForm(prev => ({
                ...prev,
                signer_name: userData.full_name || ''
            }));
        } catch (error) {
            alert('Không thể tải dữ liệu khai báo: ' + error.response?.data?.detail);
            navigate('/history');
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setDeclarationForm(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }));
                },
                () => {
                    alert('Không thể lấy vị trí GPS. Vui lòng cho phép truy cập vị trí.');
                }
            );
        } else {
            alert('Trình duyệt không hỗ trợ GPS.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDeclarationForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setDeclarationForm(prev => ({
            ...prev,
            evidence_image: e.target.files[0]
        }));
    };

    const handleStep1Submit = async (e) => {
        e.preventDefault();
        try {
            const declarationData = { ...declarationForm };
            delete declarationData.evidence_image;
            
            let declaration;
            if (editMode && editId) {
                // Update existing declaration
                declaration = await cropAPI.updateDeclaration(editId, declarationData);
                setSelectedDeclaration(declaration);
            } else {
                // Create new declaration
                declaration = await cropAPI.createDeclaration(declarationData);
                setSelectedDeclaration(declaration);
            }
            
            // Upload evidence if provided
            if (declarationForm.evidence_image) {
                const formData = new FormData();
                formData.append('file', declarationForm.evidence_image);
                await cropAPI.uploadEvidence(declaration.id, formData);
            }
            
            setCurrentStep(2);
        } catch (error) {
            const action = editMode ? 'cập nhật' : 'tạo';
            alert(`Có lỗi xảy ra khi ${action} khai báo: ` + error.response?.data?.detail);
        }
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();
        try {
            const declarationId = selectedDeclaration?.id || editId;
            if (!declarationId) {
                alert('Không tìm thấy thông tin khai báo');
                return;
            }
            
            const commitmentData = {
                ...commitmentForm,
                crop_declaration_id: declarationId
            };
            
            await cropAPI.createCommitment(declarationId, commitmentData);
            setCurrentStep(3);
        } catch (error) {
            alert('Có lỗi xảy ra khi tạo cam kết: ' + error.response?.data?.detail);
        }
    };

    const handleStep3Submit = async () => {
        try {
            const declarationId = selectedDeclaration?.id || editId;
            if (!declarationId) {
                alert('Không tìm thấy thông tin khai báo');
                return;
            }
            
            await cropAPI.submitDeclaration(declarationId);
            alert('Nộp khai báo thành công! Đang chờ xác nhận từ admin.');
            
            // Navigate back to history if in edit/commit mode, otherwise reset form
            if (editMode || searchParams.get('commit')) {
                navigate('/history');
            } else {
                // Reset form and go back to step 1 for new declaration
                setCurrentStep(1);
                setDeclarationForm({
                    area_name: '',
                    latitude: null,
                    longitude: null,
                    area_size: '',
                    crop_type: '',
                    planting_years: '',
                    evidence_image: null
                });
                setCommitmentForm({
                    commitment_text: '',
                    signature_data: '',
                    signer_name: ''
                });
                setSelectedDeclaration(null);
            }
        } catch (error) {
            alert('Có lỗi xảy ra khi nộp khai báo: ' + error.response?.data?.detail);
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
        <Layout user={user}>
            <div className="max-w-6xl mx-auto px-4 md:px-0">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                                {editMode ? 'Cập nhật khai báo' : 
                                 searchParams.get('commit') ? 'Ký cam kết' : 
                                 'Khai báo thông tin cây trồng'}
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm md:text-base">
                                {editMode ? 'Chỉnh sửa thông tin khai báo của bạn' :
                                 searchParams.get('commit') ? 'Ký cam kết cho khai báo đã tạo' :
                                 'Khai báo và quản lý thông tin cây trồng của bạn'}
                            </p>
                        </div>
                        {(editMode || searchParams.get('commit')) && (
                            <button
                                onClick={() => navigate('/history')}
                                className="text-gray-500 hover:text-gray-700 text-sm md:text-base"
                            >
                                ← Quay lại lịch sử
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="mb-6 md:mb-8">
                    <div className="flex items-center justify-center space-x-4 md:space-x-8">
                        {/* Step 1 */}
                        <div className="flex items-center">
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-medium ${
                                currentStep >= 1 ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                                {currentStep > 1 ? '✓' : '1'}
                            </div>
                            <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium text-gray-700">Khai báo</span>
                        </div>
                        
                        <div className="w-8 md:w-16 h-1 bg-gray-300">
                            <div className={`h-full transition-all ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        </div>
                        
                        {/* Step 2 */}
                        <div className="flex items-center">
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-medium ${
                                currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                                {currentStep > 2 ? '✓' : '2'}
                            </div>
                            <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium text-gray-700">Ký Cam Kết</span>
                        </div>
                        
                        <div className="w-8 md:w-16 h-1 bg-gray-300">
                            <div className={`h-full transition-all ${currentStep >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        </div>
                        
                        {/* Step 3 */}
                        <div className="flex items-center">
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-medium ${
                                currentStep >= 3 ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                                {currentStep > 3 ? '✓' : '3'}
                            </div>
                            <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium text-gray-700">Xác nhận</span>
                        </div>
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6 md:p-8">
                    {currentStep === 1 && (
                        <div>
                            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4 md:mb-6">Thông tin khai báo cây trồng</h3>
                            <form onSubmit={handleStep1Submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Khu vực
                                        </label>
                                        <input
                                            type="text"
                                            name="area_name"
                                            value={declarationForm.area_name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-green-500/40 focus:border-green-500 focus:bg-white text-gray-900 font-medium shadow-inner transition-all duration-200"
                                            placeholder="Nhập tên khu vực"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Diện tích (hecta)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="area_size"
                                            value={declarationForm.area_size}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-green-500/40 focus:border-green-500 focus:bg-white text-gray-900 font-medium shadow-inner transition-all duration-200"
                                            placeholder="VD: 2.5"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Loại cây trồng
                                        </label>
                                        <input
                                            type="text"
                                            name="crop_type"
                                            value={declarationForm.crop_type}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-green-500/40 focus:border-green-500 focus:bg-white text-gray-900 font-medium shadow-inner transition-all duration-200"
                                            placeholder="VD: Lúa, Ngô, Cà phê"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số năm trồng
                                        </label>
                                        <input
                                            type="number"
                                            name="planting_years"
                                            value={declarationForm.planting_years}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-green-500/40 focus:border-green-500 focus:bg-white text-gray-900 font-medium shadow-inner transition-all duration-200"
                                            placeholder="VD: 3"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                {/* GPS Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Vị trí GPS
                                    </label>
                                    <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                                        <button
                                            type="button"
                                            onClick={getCurrentLocation}
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 md:px-5 md:py-3 rounded-xl text-sm font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                                        >
                                            Lấy vị trí hiện tại
                                        </button>
                                        {declarationForm.latitude && declarationForm.longitude && (
                                            <span className="text-xs md:text-sm text-gray-600">
                                                Lat: {declarationForm.latitude.toFixed(6)}, 
                                                Long: {declarationForm.longitude.toFixed(6)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Evidence Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ảnh minh chứng (tuỳ chọn)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-green-500/40 focus:border-green-500 focus:bg-white text-gray-900 font-medium shadow-inner transition-all duration-200"
                                    />
                                </div>
                                
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={!declarationForm.latitude || !declarationForm.longitude}
                                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 md:px-8 md:py-4 rounded-xl text-base font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                                    >
                                        Tiếp tục
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div>
                            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4 md:mb-6">Cam kết của nông dân</h3>
                            <form onSubmit={handleStep2Submit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nội dung cam kết
                                    </label>
                                    <textarea
                                        name="commitment_text"
                                        value={commitmentForm.commitment_text}
                                        onChange={(e) => setCommitmentForm(prev => ({...prev, commitment_text: e.target.value}))}
                                        rows="6"
                                        className="w-full px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-green-500/40 focus:border-green-500 focus:bg-white text-gray-900 font-medium shadow-inner transition-all duration-200"
                                        placeholder="Tôi cam kết thông tin khai báo là chính xác và chịu trách nhiệm trước pháp luật..."
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên người ký
                                    </label>
                                    <input
                                        type="text"
                                        value={commitmentForm.signer_name}
                                        onChange={(e) => setCommitmentForm(prev => ({...prev, signer_name: e.target.value}))}
                                        className="w-full px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-green-500/40 focus:border-green-500 focus:bg-white text-gray-900 font-medium shadow-inner transition-all duration-200"
                                        placeholder={user?.full_name}
                                        required
                                    />
                                </div>
                                
                                {/* Canvas Signature */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chữ ký
                                    </label>
                                    <SignatureCanvas
                                        onSignatureChange={(signature) => 
                                            setCommitmentForm(prev => ({...prev, signature_data: signature}))
                                        }
                                        width={window.innerWidth > 768 ? 400 : Math.min(window.innerWidth - 100, 300)}
                                        height={200}
                                    />
                                </div>
                                
                                <div className="flex flex-col md:flex-row justify-between space-y-3 md:space-y-0">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-4 md:px-8 md:py-4 rounded-xl text-base font-semibold shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!commitmentForm.signature_data}
                                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 md:px-8 md:py-4 rounded-xl text-base font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                                    >
                                        Ký cam kết
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div>
                            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4 md:mb-6">Xác nhận và nộp khai báo</h3>
                            <div className="space-y-6">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">
                                                Xác nhận thông tin
                                            </h3>
                                            <div className="mt-2 text-sm text-yellow-700">
                                                <p>Vui lòng kiểm tra lại tất cả thông tin trước khi nộp. Sau khi nộp, bạn sẽ không thể chỉnh sửa và cần chờ admin xác nhận.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900">Thông tin khai báo</h4>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><span className="font-medium">Khu vực:</span> {declarationForm.area_name}</p>
                                            <p><span className="font-medium">Diện tích:</span> {declarationForm.area_size} hecta</p>
                                            <p><span className="font-medium">Loại cây:</span> {declarationForm.crop_type}</p>
                                            <p><span className="font-medium">Số năm trồng:</span> {declarationForm.planting_years} năm</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900">Thông tin cam kết</h4>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><span className="font-medium">Người ký:</span> {commitmentForm.signer_name}</p>
                                            <p><span className="font-medium">Chữ ký:</span> Đã ký</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col md:flex-row justify-between space-y-3 md:space-y-0">
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-4 md:px-8 md:py-4 rounded-xl text-base font-semibold shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handleStep3Submit}
                                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 md:px-8 md:py-4 rounded-xl text-base font-semibold shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                                    >
                                        NỘP
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>


            </div>
        </Layout>
    );
};

export default CropDeclaration;